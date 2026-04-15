'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  DownloadIcon,
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  RefreshCcwIcon,
  SendIcon,
  ShareIcon,
  Trash2Icon,
  WrenchIcon,
  XCircleIcon,
} from 'lucide-react'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/components/AuthProvider'
import { QuoteStatusBadge } from '@/components/quotes/QuoteStatusBadge'
import { AddEditQuoteItemModal } from '@/components/quotes/AddEditQuoteItemModal'
import { QuoteItemServicesModal } from '@/components/quotes/QuoteItemServicesModal'
import {
  getQuoteById,
  updateQuote,
  transitionQuoteStatus,
  deleteQuoteItem,
} from '@/lib/quotes-api'
import { formatCurrency, formatDate } from '@/lib/formatters'
import type { QuoteDTO, QuoteItemDTO, QuoteStatus, DiscountType } from '@/types/quote'

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

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const canEdit = user?.role === 'ADMIN' || user?.role === 'OPERATOR'

  const [quote, setQuote] = useState<QuoteDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // header editor state (only for DRAFT)
  const [headerNotes, setHeaderNotes] = useState('')
  const [headerValidUntil, setHeaderValidUntil] = useState('')
  const [headerDiscountType, setHeaderDiscountType] = useState<DiscountType | ''>('')
  const [headerDiscountValue, setHeaderDiscountValue] = useState('')
  const [isSavingHeader, setIsSavingHeader] = useState(false)

  // status transition state
  const [isTransitioning, setIsTransitioning] = useState(false)

  // modals
  const [addItemOpen, setAddItemOpen] = useState(false)
  const [editItem, setEditItem] = useState<QuoteItemDTO | null>(null)
  const [servicesItem, setServicesItem] = useState<QuoteItemDTO | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<QuoteItemDTO | null>(null)
  const [isDeletingItem, setIsDeletingItem] = useState(false)
  const [isPdfGenerating, setIsPdfGenerating] = useState(false)

  function applyUpdate(updated: QuoteDTO) {
    setQuote(updated)
  }

  async function handleExportPdf(share = false) {
    if (!quote) return
    setIsPdfGenerating(true)
    try {
      // Load full quote with items if not already loaded
      const fullQuote = quote.items ? quote : await getQuoteById(quote.id)

      // Dynamic import to keep jspdf out of SSR bundle
      const { buildQuotePdf } = await import('@/lib/quote-pdf')
      const { blob, filename } = buildQuotePdf(fullQuote)

      if (share && typeof navigator.share === 'function') {
        try {
          const file = new File([blob], filename, { type: 'application/pdf' })
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: `Orçamento ${fullQuote.code}`,
              text: `Orçamento ${fullQuote.code} - Rev. ${fullQuote.revision}`,
            })
            return
          }
        } catch (shareErr) {
          if ((shareErr as Error)?.name === 'AbortError') return
          // Otherwise fallback to download
        }
      }

      // Download fallback
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)

      if (share) {
        toast.info('Seu navegador não suporta compartilhar. O arquivo foi baixado.')
      }
    } catch {
      toast.error('Erro ao gerar o PDF.')
    } finally {
      setIsPdfGenerating(false)
    }
  }

  async function loadQuote() {
    setIsLoading(true)
    setHasError(false)
    try {
      const data = await getQuoteById(id)
      setQuote(data)
      setHeaderNotes(data.notes ?? '')
      setHeaderValidUntil(data.validUntil ? data.validUntil.slice(0, 10) : '')
      setHeaderDiscountType(data.discountType ?? '')
      setHeaderDiscountValue(data.discountValue != null ? String(data.discountValue) : '')
    } catch {
      toast.error('Erro ao carregar orçamento.')
      setHasError(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadQuote() }, [id])

  async function handleSaveHeader() {
    if (!quote) return
    setIsSavingHeader(true)
    try {
      const updated = await updateQuote(quote.id, {
        notes: headerNotes || undefined,
        validUntil: headerValidUntil || undefined,
        discountType: (headerDiscountType as DiscountType) || undefined,
        discountValue: headerDiscountValue ? Number(headerDiscountValue) : undefined,
      })
      applyUpdate(updated)
      toast.success('Orçamento atualizado.')
    } catch {
      toast.error('Erro ao salvar o orçamento.')
    } finally {
      setIsSavingHeader(false)
    }
  }

  async function handleTransition(to: QuoteStatus) {
    if (!quote) return
    setIsTransitioning(true)
    try {
      const updated = await transitionQuoteStatus(quote.id, to)
      applyUpdate(updated)
      toast.success('Status atualizado.')
    } catch {
      toast.error('Transição de status inválida.')
    } finally {
      setIsTransitioning(false)
    }
  }

  async function handleDeleteItem() {
    if (!quote || !deleteConfirm) return
    setIsDeletingItem(true)
    try {
      const updated = await deleteQuoteItem(quote.id, deleteConfirm.id)
      applyUpdate(updated)
      setDeleteConfirm(null)
      toast.success('Item removido.')
    } catch {
      toast.error('Erro ao remover o item.')
    } finally {
      setIsDeletingItem(false)
    }
  }

  const isDraft = quote?.status === 'DRAFT'
  const isSent = quote?.status === 'SENT'

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground gap-2">
        <Loader2Icon className="size-5 animate-spin" />
        <span>Carregando orçamento…</span>
      </div>
    )
  }

  if (hasError || !quote) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>
            Não foi possível carregar o orçamento.{' '}
            <button className="underline" onClick={loadQuote}>Tentar novamente</button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-10 w-full mx-auto flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-700">
      {/* Back + Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link href="/quotes"><ArrowLeftIcon className="size-4" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400">
                {quote.code}
              </h1>
              <Badge variant="outline" className="text-xs">v{quote.revision}</Badge>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <QuoteStatusBadge status={quote.status} />
              {quote.sentAt && (
                <span className="text-xs text-muted-foreground">Enviado: {formatDate(quote.sentAt)}</span>
              )}
              {quote.approvedAt && (
                <span className="text-xs text-muted-foreground">Aprovado: {formatDate(quote.approvedAt)}</span>
              )}
              {quote.rejectedAt && (
                <span className="text-xs text-muted-foreground">Rejeitado: {formatDate(quote.rejectedAt)}</span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        {canEdit && (
          <div className="flex flex-wrap gap-2">
            {isDraft && (
              <Button
                onClick={() => handleTransition('SENT')}
                disabled={isTransitioning}
                size="sm"
              >
                {isTransitioning ? <Loader2Icon className="size-4 animate-spin" /> : <SendIcon className="size-4" />}
                Enviar
              </Button>
            )}
            {isSent && (
              <>
                <Button
                  onClick={() => handleTransition('APPROVED')}
                  disabled={isTransitioning}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircleIcon className="size-4" />
                  Aprovar
                </Button>
                <Button
                  onClick={() => handleTransition('REJECTED')}
                  disabled={isTransitioning}
                  variant="destructive"
                  size="sm"
                >
                  <XCircleIcon className="size-4" />
                  Rejeitar
                </Button>
                <Button
                  onClick={() => handleTransition('DRAFT')}
                  disabled={isTransitioning}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCcwIcon className="size-4" />
                  Solicitar Modificação
                </Button>
              </>
            )}
          </div>
        )}

        {/* PDF export — always visible */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={isPdfGenerating}
            onClick={() => handleExportPdf(false)}
          >
            {isPdfGenerating
              ? <Loader2Icon className="size-4 animate-spin" />
              : <DownloadIcon className="size-4" />}
            Baixar PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isPdfGenerating}
            onClick={() => handleExportPdf(true)}
          >
            <ShareIcon className="size-4" />
            Compartilhar
          </Button>
        </div>
      </div>

      {/* Two-column layout: left = details/items, right = sticky financial summary */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
      <div className="flex flex-col gap-6 flex-1 min-w-0">

      {/* Header editor — DRAFT only */}
      {isDraft && canEdit && (
        <div className="glass-card p-5 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Detalhes do Orçamento</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2 flex flex-col gap-1.5">
              <Label>Observações</Label>
              <Textarea
                value={headerNotes}
                onChange={(e) => setHeaderNotes(e.target.value)}
                rows={2}
                placeholder="Observações internas ou para o cliente…"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Válido até</Label>
              <Input
                type="date"
                value={headerValidUntil}
                onChange={(e) => setHeaderValidUntil(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Desconto</Label>
              <div className="flex gap-2">
                <Select
                  value={headerDiscountType}
                  onValueChange={(v) => setHeaderDiscountType(v as DiscountType)}
                >
                  <SelectTrigger className="w-28 shrink-0">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENT">%</SelectItem>
                    <SelectItem value="AMOUNT">R$</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={headerDiscountValue}
                  onChange={(e) => setHeaderDiscountValue(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveHeader} disabled={isSavingHeader} size="sm">
              {isSavingHeader ? <Loader2Icon className="size-4 animate-spin mr-2" /> : null}
              Salvar Alterações
            </Button>
          </div>
        </div>
      )}

      {/* Read-only notes (non-DRAFT) */}
      {!isDraft && quote.notes && (
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground font-medium mb-1">Observações</p>
          <p className="text-sm">{quote.notes}</p>
        </div>
      )}

      {/* Items */}
      <div className="glass-card overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="font-semibold">Itens</h2>
          {isDraft && canEdit && (
            <Button size="sm" onClick={() => setAddItemOpen(true)}>
              <PlusIcon className="size-4" />
              Adicionar Item
            </Button>
          )}
        </div>
        <Separator />
        <div className="overflow-auto px-1">
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 pl-5">#</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Espessura</TableHead>
                <TableHead>Dimensões / Chapas</TableHead>
                <TableHead className="text-right">Custo material</TableHead>
                <TableHead className="text-right">Serviços</TableHead>
                <TableHead className="text-right">Total</TableHead>
                {isDraft && canEdit && <TableHead className="w-28 pr-5" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {!quote.items || quote.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isDraft && canEdit ? 9 : 8} className="text-center text-muted-foreground py-8">
                    Nenhum item adicionado.
                  </TableCell>
                </TableRow>
              ) : (
                quote.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-muted-foreground pl-5">{item.partNumber}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{ITEM_KIND_LABEL[item.itemKind]}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.materialName}
                      {item.isMaterialProvidedByClient && (
                        <Badge variant="outline" className="ml-2 text-xs font-normal text-green-600 border-green-500">
                          Fornecido pelo cliente
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{item.thickness} mm</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.itemKind === 'SHEET' ? (
                        <span>
                          {item.sheetWidth ?? '—'} × {item.sheetHeight ?? '—'} mm
                          {' · '}
                          {item.computedSheetUnits !== item.sheetCount ? (
                            <span title={`${item.sheetCount} chapas, última parcial`}>
                              {item.computedSheetUnits.toFixed(2)} chapas
                            </span>
                          ) : (
                            <span>{item.sheetCount} {item.sheetCount === 1 ? 'chapa' : 'chapas'}</span>
                          )}
                        </span>
                      ) : (
                        `${PROFILE_TYPE_LABEL[item.profileType ?? ''] ?? '—'} – ${item.profileLength ?? '—'} mm`
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {item.isMaterialProvidedByClient ? (
                        <span className="line-through text-muted-foreground">{formatCurrency(item.materialCost)}</span>
                      ) : (
                        formatCurrency(item.materialCost)
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {item.servicesCost > 0 ? (
                        <span className="inline-flex items-center gap-1">
                          <span className="size-1.5 rounded-full bg-blue-500 shrink-0" />
                          {formatCurrency(item.servicesCost)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(item.totalItemCost)}
                    </TableCell>
                    {isDraft && canEdit && (
                      <TableCell className="pr-5">
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            title={`Serviços${item.services && item.services.length > 0 ? ` (${item.services.length})` : ''}`}
                            onClick={() => setServicesItem(item)}
                            className="relative"
                          >
                            <WrenchIcon className="size-4" />
                            {item.services && item.services.length > 0 && (
                              <span className="absolute -top-1 -right-1 size-4 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                                {item.services.length}
                              </span>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Editar"
                            onClick={() => setEditItem(item)}
                          >
                            <PencilIcon className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Excluir"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteConfirm(item)}
                          >
                            <Trash2Icon className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>{/* end items glass-card */}

      </div>{/* end left column */}

      {/* Right column — sticky financial summary */}
      <div className="lg:sticky lg:top-6 w-full lg:w-72 shrink-0 self-start">
      <div className="glass-card p-5 flex flex-col gap-2">
        <h2 className="font-semibold mb-1">Resumo Financeiro</h2>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Material</span>
          <span>{formatCurrency(quote.totalMaterial)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Corte</span>
          <span>{formatCurrency(quote.totalCutting)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Setup</span>
          <span>{formatCurrency(quote.totalSetup)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Serviços</span>
          <span>{formatCurrency(quote.totalServices)}</span>
        </div>
        <Separator className="my-1" />
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatCurrency(quote.subtotalQuote)}</span>
        </div>
        {quote.discountAmount > 0 && (
          <div className="flex justify-between text-sm text-red-500">
            <span>Desconto</span>
            <span>- {formatCurrency(quote.discountAmount)}</span>
          </div>
        )}
        <Separator className="my-1" />
        <div className="flex justify-between font-bold text-base">
          <span>Total</span>
          <span>{formatCurrency(quote.totalQuote)}</span>
        </div>
      </div>
      </div>{/* end right column */}

      </div>{/* end two-column layout */}

      {/* Modals */}
      <AddEditQuoteItemModal
        open={addItemOpen}
        onClose={() => setAddItemOpen(false)}
        quoteId={quote.id}
        onSaved={(q) => { applyUpdate(q); setAddItemOpen(false) }}
      />

      {editItem && (
        <AddEditQuoteItemModal
          open={!!editItem}
          onClose={() => setEditItem(null)}
          quoteId={quote.id}
          item={editItem}
          onSaved={(q) => { applyUpdate(q); setEditItem(null) }}
        />
      )}

      {servicesItem && (
        <QuoteItemServicesModal
          open={!!servicesItem}
          onClose={() => setServicesItem(null)}
          quoteId={quote.id}
          item={servicesItem}
          onSaved={(q) => { applyUpdate(q); setServicesItem(null) }}
        />
      )}

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={(o) => { if (!o) setDeleteConfirm(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir item</DialogTitle>
            <DialogDescription>
              Deseja realmente excluir o item <strong>{deleteConfirm?.materialName}</strong>? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={isDeletingItem}
              onClick={handleDeleteItem}
            >
              {isDeletingItem ? <Loader2Icon className="size-4 animate-spin mr-1" /> : null}
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
