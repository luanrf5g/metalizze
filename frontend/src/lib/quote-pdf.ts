import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { QuoteDTO, QuoteItemDTO } from '@/types/quote'

const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Rascunho',
  SENT: 'Enviado',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado',
  EXPIRED: 'Expirado',
}

const ITEM_KIND_LABEL: Record<string, string> = {
  SHEET: 'Chapa',
  PROFILE: 'Perfil',
}

const PROFILE_TYPE_LABEL: Record<string, string> = {
  SQUARE: 'Quadrado',
  RECTANGULAR: 'Retangular',
  ROUND: 'Redondo',
  OBLONG: 'Oblongo',
  ANGLE: 'Cantoneira',
  U_CHANNEL: 'Perfil U',
}

function fmtCurrency(v: number | null | undefined): string {
  if (v == null) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function fmtDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d)
}

function itemDimensions(item: QuoteItemDTO): string {
  if (item.itemKind === 'SHEET') {
    const w = item.sheetWidth ?? '—'
    const h = item.sheetHeight ?? '—'
    const units =
      item.computedSheetUnits !== item.sheetCount
        ? `${item.computedSheetUnits.toFixed(2)} chapas`
        : `${item.sheetCount} chapa${item.sheetCount !== 1 ? 's' : ''}`
    return `${w}×${h} mm · ${units}`
  }
  const type = PROFILE_TYPE_LABEL[item.profileType ?? ''] ?? '—'
  return `${type} – ${item.profileLength ?? '—'} mm`
}

export function buildQuotePdfFilename(quote: QuoteDTO): string {
  // quote.code format: "ORC-2604-SI0QM-4810" — extract the 3rd segment (index 2)
  const codePart = quote.code.split('-')[2] ?? quote.code

  const clientPart = (quote.client?.name ?? quote.clientId ?? 'AVULSO')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')

  const created = new Date(quote.createdAt)
  const dd = String(created.getDate()).padStart(2, '0')
  const mm = String(created.getMonth() + 1).padStart(2, '0')
  const yyyy = created.getFullYear()
  const rev = String(quote.revision).padStart(4, '0')

  // ORC-{CODE}_{REVISION}_{CLIENT}-{DD-MM-YYYY}.pdf
  return `ORC-${codePart}_${rev}_${clientPart}-${dd}-${mm}-${yyyy}.pdf`
}

type JsPDFWithTable = jsPDF & { lastAutoTable: { finalY: number } }

export function buildQuotePdf(quote: QuoteDTO): { blob: Blob; filename: string } {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' }) as JsPDFWithTable
  const pageWidth = doc.internal.pageSize.getWidth()
  const marginL = 14
  let y = 14

  /* ── Header ── */
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(`Orçamento ${quote.code}`, marginL, y)
  y += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Status: ${STATUS_LABEL[quote.status] ?? quote.status}`, marginL, y)
  doc.text(`Revisão: v${quote.revision}`, pageWidth - 54, y)
  y += 6

  doc.text(`Criado em: ${fmtDate(quote.createdAt)}`, marginL, y)
  if (quote.sentAt) doc.text(`Enviado em: ${fmtDate(quote.sentAt)}`, pageWidth - 74, y)
  y += 6

  if (quote.approvedAt) { doc.text(`Aprovado em: ${fmtDate(quote.approvedAt)}`, marginL, y); y += 6 }
  if (quote.rejectedAt) { doc.text(`Rejeitado em: ${fmtDate(quote.rejectedAt)}`, marginL, y); y += 6 }

  /* ── Client + CreatedBy ── */
  y += 2
  doc.setLineWidth(0.3)
  doc.line(marginL, y, pageWidth - marginL, y)
  y += 6

  if (quote.client) {
    doc.setFont('helvetica', 'bold')
    doc.text('Cliente:', marginL, y)
    doc.setFont('helvetica', 'normal')
    doc.text(quote.client.name, marginL + 20, y)
    y += 6
  }

  if (quote.createdBy) {
    doc.setFont('helvetica', 'bold')
    doc.text('Criado por:', marginL, y)
    doc.setFont('helvetica', 'normal')
    doc.text(quote.createdBy.name, marginL + 26, y)
    y += 6
  }

  /* ── Notes ── */
  if (quote.notes) {
    y += 2
    doc.setFont('helvetica', 'bold')
    doc.text('Observações:', marginL, y)
    y += 5
    doc.setFont('helvetica', 'normal')
    const lines = doc.splitTextToSize(quote.notes, pageWidth - marginL * 2) as string[]
    doc.text(lines, marginL, y)
    y += lines.length * 5
  }

  /* ── Items table ── */
  y += 4
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('Itens', marginL, y)
  y += 4

  const items = quote.items ?? []

  // Build rows: each item row optionally followed by service sub-rows
  type RowStyle = { isService: boolean }
  type CellDef = string | { content: string; colSpan?: number; styles?: object }
  const bodyRows: CellDef[][] = []
  const rowMeta: RowStyle[] = []

  for (const item of items) {
    const partNum = item.partNumber
    bodyRows.push([
      String(partNum),
      ITEM_KIND_LABEL[item.itemKind] ?? item.itemKind,
      item.materialName + (item.isMaterialProvidedByClient ? ' *' : ''),
      `${item.thickness} mm`,
      itemDimensions(item),
      `${item.cuttingTimeMinutes} min`,
      item.isMaterialProvidedByClient
        ? `(${fmtCurrency(item.materialCost)})`
        : fmtCurrency(item.materialCharged),
      fmtCurrency(item.servicesCost),
      fmtCurrency(item.totalItemCost),
    ])
    rowMeta.push({ isService: false })

      ; (item.services ?? []).forEach((svc, svcIdx) => {
        const label = svc.serviceName ?? `Servico (${svc.serviceId.slice(0, 6)})`
        const unitLabel = svc.unitLabel ? ` ${svc.unitLabel}` : ''
        const subNum = `${partNum}.${svcIdx + 1}`
        // col 0: subNum | col 1-2 merged: label (colSpan 2) | col 3: '' | col 4: qty | col 5: '' | col 6: '' | col 7: price×qty | col 8: total
        bodyRows.push([
          '',
          { content: subNum, styles: { fontStyle: 'italic', textColor: [100, 100, 100] } },
          { content: label, colSpan: 2, styles: { fontStyle: 'italic', textColor: [50, 50, 50] } },
          `${svc.quantity}${unitLabel}`,
          '',
          '',
          { content: `${fmtCurrency(svc.unitPrice)} x ${svc.quantity}`, styles: { textColor: [80, 80, 80] } },
          { content: fmtCurrency(svc.totalPrice), styles: { fontStyle: 'italic' } },
        ])
        rowMeta.push({ isService: true })
      })
  }

  autoTable(doc, {
    startY: y,
    margin: { left: marginL, right: marginL },
    head: [['#', 'Tipo', 'Material', 'Esp.', 'Dimensões / Qtd', 'T. corte', 'Mat. cobrado', 'Serviços', 'Total']],
    body: bodyRows,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [30, 30, 30], fontSize: 8, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 8 },
      3: { cellWidth: 14 },
      5: { cellWidth: 18 },
      6: { cellWidth: 24 },
      7: { cellWidth: 20 },
      8: { cellWidth: 24 },
    },
    didParseCell(data) {
      if (rowMeta[data.row.index]?.isService) {
        // Fixed light-blue tint — overrides alternating stripe
        data.cell.styles.fillColor = [232, 240, 254]
        data.cell.styles.fontSize = 7.5
      }
    },
  })

  if (items.some((i) => i.isMaterialProvidedByClient)) {
    const fy = doc.lastAutoTable.finalY + 4
    doc.setFontSize(8)
    doc.setFont('helvetica', 'italic')
    doc.text('* Material fornecido pelo cliente (não cobrado)', marginL, fy)
  }

  /* ── Financial summary ── */
  const summaryY = doc.lastAutoTable.finalY + 12
  const colLabel = pageWidth - 80
  const colValue = pageWidth - marginL

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Resumo Financeiro', marginL, summaryY)

  const rows: [string, string][] = [
    ['Material', fmtCurrency(quote.totalMaterial)],
    ['Corte', fmtCurrency(quote.totalCutting)],
    ['Setup', fmtCurrency(quote.totalSetup)],
    ['Serviços', fmtCurrency(quote.totalServices)],
    ['Subtotal', fmtCurrency(quote.subtotalQuote)],
  ]

  if (quote.discountAmount > 0) {
    const label =
      quote.discountType === 'PERCENT'
        ? `Desconto (${quote.discountValue}%)`
        : 'Desconto'
    rows.push([label, `- ${fmtCurrency(quote.discountAmount)}`])
  }

  rows.push(['TOTAL', fmtCurrency(quote.totalQuote)])

  let sy = summaryY + 6
  doc.setFontSize(9)
  for (let i = 0; i < rows.length; i++) {
    const [label, value] = rows[i]
    const isTotalRow = i === rows.length - 1
    doc.setFont('helvetica', isTotalRow ? 'bold' : 'normal')
    if (isTotalRow) {
      doc.setLineWidth(0.3)
      doc.line(colLabel - 4, sy - 3, colValue, sy - 3)
    }

    // measure text widths to know where to start/end the dots
    const labelW = doc.getTextWidth(label)
    const valueW = doc.getTextWidth(value)
    const dotChar = '.'
    const dotW = doc.getTextWidth(dotChar)
    const gapStart = colLabel + labelW + 1.5
    const gapEnd = colValue - valueW - 1.5
    const gapWidth = gapEnd - gapStart
    if (gapWidth > dotW * 2) {
      const dotCount = Math.floor(gapWidth / dotW)
      const dots = dotChar.repeat(dotCount)
      doc.setTextColor(160, 160, 160)
      doc.text(dots, gapStart, sy)
      doc.setTextColor(0, 0, 0)
    }

    doc.text(label, colLabel, sy, { align: 'left' })
    doc.text(value, colValue, sy, { align: 'right' })
    sy += 5
  }

  /* ── Page numbers ── */
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(150)
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' },
    )
    doc.setTextColor(0)
  }

  const blob = doc.output('blob')
  const filename = buildQuotePdfFilename(quote)
  return { blob, filename }
}
