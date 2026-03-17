'use client'

import { useEffect, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { AlertCircleIcon, Download, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import { formatCurrency, formatDate, translateSheetType } from '@/lib/formatters'
import { MetricDeltaBadge } from '@/components/MetricDeltaBadge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type ReportPeriod = '7d' | '30d' | '90d' | '180d' | '365d'

const PERIOD_OPTIONS: Array<{ value: ReportPeriod; label: string }> = [
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
  { value: '90d', label: 'Últimos 90 dias' },
  { value: '180d', label: 'Últimos 180 dias' },
  { value: '365d', label: 'Últimos 12 meses' },
]

interface ReportsMetrics {
  selectedPeriod: {
    key: ReportPeriod
    label: string
    days: number
    startDate: string
    endDate: string
  }
  overview: {
    totalStockValue: number
    standardStockValue: number
    scrapStockValue: number
    totalStandardSheets: number
    totalScrapSheets: number
    totalInventoryUnits: number
    totalMaterials: number
    totalClients: number
    lowStockSheets: number
    ownedSheetsInStock: number
  }
  periodComparison: {
    cutOrders: number
    cutOrdersComparedToPreviousPeriod: number
    sheetsConsumed: number
    sheetsConsumedComparedToPreviousPeriod: number
    scrapsGenerated: number
    scrapsGeneratedComparedToPreviousPeriod: number
    scrapsReused: number
    scrapsReusedComparedToPreviousPeriod: number
  }
  weeklyComparison: {
    cutOrdersCurrentWeek: number
    cutOrdersComparedToLastWeek: number
    sheetsConsumedCurrentWeek: number
    sheetsConsumedComparedToLastWeek: number
    scrapsGeneratedCurrentWeek: number
    scrapsGeneratedComparedToLastWeek: number
    scrapsReusedCurrentWeek: number
    scrapsReusedComparedToLastWeek: number
  }
  monthlySnapshot: {
    cutOrdersThisMonth: number
    sheetsConsumedThisMonth: number
    scrapsGeneratedThisMonth: number
    scrapsReusedThisMonth: number
  }
  totals: {
    totalCutOrders: number
    totalSheetsConsumed: number
    totalScrapsGenerated: number
    totalScrapsReused: number
    clientsWithOwnedSheetOrders: number
    ownedSheetCutOrders: number
  }
  charts: {
    stockValueTrend: Array<{
      date: string
      label: string
      totalValue: number
      standardValue: number
      scrapValue: number
    }>
    operationalTrend: Array<{
      label: string
      orders: number
      sheetsConsumed: number
      scrapsGenerated: number
      scrapsReused: number
    }>
    materialPerformance: Array<{
      name: string
      stockValue: number
      standardSheets: number
      scrapSheets: number
      sheetsConsumed: number
      scrapsGenerated: number
      scrapsReused: number
    }>
  }
  topClients: Array<{
    id: string
    name: string
    cutOrders: number
    sheetsConsumed: number
  }>
  recentCutOrders: Array<{
    id: string
    createdAt: string
    quantity: number
    description: string | null
    sheetSku: string
    sheetType: 'STANDARD' | 'SCRAP'
    materialName: string
    clientName: string | null
  }>
}

function toNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function normalizeReportsMetrics(raw: any): ReportsMetrics {
  return {
    selectedPeriod: {
      key: raw?.selectedPeriod?.key ?? '90d',
      label: raw?.selectedPeriod?.label ?? 'Últimos 90 dias',
      days: toNumber(raw?.selectedPeriod?.days ?? 90),
      startDate: raw?.selectedPeriod?.startDate ?? new Date().toISOString(),
      endDate: raw?.selectedPeriod?.endDate ?? new Date().toISOString(),
    },
    overview: {
      totalStockValue: toNumber(raw?.overview?.totalStockValue),
      standardStockValue: toNumber(raw?.overview?.standardStockValue),
      scrapStockValue: toNumber(raw?.overview?.scrapStockValue),
      totalStandardSheets: toNumber(raw?.overview?.totalStandardSheets),
      totalScrapSheets: toNumber(raw?.overview?.totalScrapSheets),
      totalInventoryUnits: toNumber(raw?.overview?.totalInventoryUnits),
      totalMaterials: toNumber(raw?.overview?.totalMaterials),
      totalClients: toNumber(raw?.overview?.totalClients),
      lowStockSheets: toNumber(raw?.overview?.lowStockSheets),
      ownedSheetsInStock: toNumber(raw?.overview?.ownedSheetsInStock),
    },
    periodComparison: {
      cutOrders: toNumber(raw?.periodComparison?.cutOrders),
      cutOrdersComparedToPreviousPeriod: toNumber(raw?.periodComparison?.cutOrdersComparedToPreviousPeriod),
      sheetsConsumed: toNumber(raw?.periodComparison?.sheetsConsumed),
      sheetsConsumedComparedToPreviousPeriod: toNumber(raw?.periodComparison?.sheetsConsumedComparedToPreviousPeriod),
      scrapsGenerated: toNumber(raw?.periodComparison?.scrapsGenerated),
      scrapsGeneratedComparedToPreviousPeriod: toNumber(raw?.periodComparison?.scrapsGeneratedComparedToPreviousPeriod),
      scrapsReused: toNumber(raw?.periodComparison?.scrapsReused),
      scrapsReusedComparedToPreviousPeriod: toNumber(raw?.periodComparison?.scrapsReusedComparedToPreviousPeriod),
    },
    weeklyComparison: {
      cutOrdersCurrentWeek: toNumber(raw?.weeklyComparison?.cutOrdersCurrentWeek),
      cutOrdersComparedToLastWeek: toNumber(raw?.weeklyComparison?.cutOrdersComparedToLastWeek),
      sheetsConsumedCurrentWeek: toNumber(raw?.weeklyComparison?.sheetsConsumedCurrentWeek),
      sheetsConsumedComparedToLastWeek: toNumber(raw?.weeklyComparison?.sheetsConsumedComparedToLastWeek),
      scrapsGeneratedCurrentWeek: toNumber(raw?.weeklyComparison?.scrapsGeneratedCurrentWeek),
      scrapsGeneratedComparedToLastWeek: toNumber(raw?.weeklyComparison?.scrapsGeneratedComparedToLastWeek),
      scrapsReusedCurrentWeek: toNumber(raw?.weeklyComparison?.scrapsReusedCurrentWeek),
      scrapsReusedComparedToLastWeek: toNumber(raw?.weeklyComparison?.scrapsReusedComparedToLastWeek),
    },
    monthlySnapshot: {
      cutOrdersThisMonth: toNumber(raw?.monthlySnapshot?.cutOrdersThisMonth),
      sheetsConsumedThisMonth: toNumber(raw?.monthlySnapshot?.sheetsConsumedThisMonth),
      scrapsGeneratedThisMonth: toNumber(raw?.monthlySnapshot?.scrapsGeneratedThisMonth),
      scrapsReusedThisMonth: toNumber(raw?.monthlySnapshot?.scrapsReusedThisMonth),
    },
    totals: {
      totalCutOrders: toNumber(raw?.totals?.totalCutOrders),
      totalSheetsConsumed: toNumber(raw?.totals?.totalSheetsConsumed),
      totalScrapsGenerated: toNumber(raw?.totals?.totalScrapsGenerated),
      totalScrapsReused: toNumber(raw?.totals?.totalScrapsReused),
      clientsWithOwnedSheetOrders: toNumber(raw?.totals?.clientsWithOwnedSheetOrders),
      ownedSheetCutOrders: toNumber(raw?.totals?.ownedSheetCutOrders),
    },
    charts: {
      stockValueTrend: Array.isArray(raw?.charts?.stockValueTrend) ? raw.charts.stockValueTrend : [],
      operationalTrend: Array.isArray(raw?.charts?.operationalTrend) ? raw.charts.operationalTrend : [],
      materialPerformance: Array.isArray(raw?.charts?.materialPerformance) ? raw.charts.materialPerformance : [],
    },
    topClients: Array.isArray(raw?.topClients) ? raw.topClients : [],
    recentCutOrders: Array.isArray(raw?.recentCutOrders) ? raw.recentCutOrders : [],
  }
}

function formatCompactCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    notation: 'compact',
    maximumFractionDigits: 1,
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function escapeCsvValue(value: unknown) {
  const text = String(value ?? '')
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

function downloadCsv(filename: string, rows: Array<Array<unknown>>) {
  const csvContent = rows.map((row) => row.map(escapeCsvValue).join(',')).join('\n')
  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function ReportCard({
  title,
  value,
  detail,
  onClick,
}: {
  title: string
  value: string | number
  detail: string
  onClick?: () => void
}) {
  return (
    <button type="button" onClick={onClick} className="text-left">
      <Card className="border-zinc-200/80 bg-white shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md">
        <CardHeader className="pb-3">
          <CardDescription className="text-xs uppercase tracking-[0.22em] text-zinc-500">{title}</CardDescription>
          <CardTitle className="text-3xl font-semibold text-zinc-950">{value}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-zinc-600">{detail}</p>
        </CardContent>
      </Card>
    </button>
  )
}

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('90d')
  const [metrics, setMetrics] = useState<ReportsMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  function scrollToSection(sectionId: string) {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function handleExportCsv() {
    if (!metrics) return

    const rows: Array<Array<unknown>> = [
      ['Metalizze Reports'],
      ['Período', metrics.selectedPeriod.label],
      ['Início', formatDate(metrics.selectedPeriod.startDate)],
      ['Fim', formatDate(metrics.selectedPeriod.endDate)],
      [],
      ['Indicador', 'Valor'],
      ['Valor total do estoque', metrics.overview.totalStockValue],
      ['Valor em chapas padrão', metrics.overview.standardStockValue],
      ['Valor em retalhos', metrics.overview.scrapStockValue],
      ['Ordens no período', metrics.periodComparison.cutOrders],
      ['Chapas consumidas no período', metrics.periodComparison.sheetsConsumed],
      ['Retalhos gerados no período', metrics.periodComparison.scrapsGenerated],
      ['Retalhos reaproveitados no período', metrics.periodComparison.scrapsReused],
      [],
      ['Tendência operacional'],
      ['Faixa', 'Ordens', 'Chapas consumidas', 'Retalhos gerados', 'Retalhos reaproveitados'],
      ...metrics.charts.operationalTrend.map((item) => [item.label, item.orders, item.sheetsConsumed, item.scrapsGenerated, item.scrapsReused]),
      [],
      ['Desempenho por material'],
      ['Material', 'Valor em estoque', 'Chapas padrão', 'Retalhos', 'Chapas consumidas', 'Retalhos gerados', 'Retalhos reaproveitados'],
      ...metrics.charts.materialPerformance.map((item) => [
        item.name,
        item.stockValue,
        item.standardSheets,
        item.scrapSheets,
        item.sheetsConsumed,
        item.scrapsGenerated,
        item.scrapsReused,
      ]),
      [],
      ['Ordens recentes'],
      ['Data', 'SKU', 'Tipo', 'Material', 'Cliente', 'Quantidade', 'Descrição'],
      ...metrics.recentCutOrders.map((item) => [
        formatDate(item.createdAt, true),
        item.sheetSku,
        translateSheetType(item.sheetType),
        item.materialName,
        item.clientName ?? 'Estoque próprio',
        item.quantity,
        item.description ?? '',
      ]),
    ]

    downloadCsv(`reports-${metrics.selectedPeriod.key}.csv`, rows)
  }

  useEffect(() => {
    async function fetchReportMetrics() {
      try {
        setHasError(false)
        setIsLoading(true)
        const response = await api.get('/metrics/reports', {
          params: {
            period: selectedPeriod,
          },
        })
        setMetrics(normalizeReportsMetrics(response.data.metrics))
      } catch (error) {
        console.error('Erro ao buscar métricas de relatórios:', error)
        setHasError(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReportMetrics()
  }, [selectedPeriod])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  if (hasError || !metrics) {
    return (
      <div className="p-6 md:p-10">
        <Alert variant="destructive">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle>Erro ao carregar relatórios</AlertTitle>
          <AlertDescription>
            Não foi possível consolidar os indicadores gerenciais do sistema neste momento.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="w-full space-y-8 p-6 md:p-10">
      <section className="rounded-[2rem] border border-zinc-200 bg-linear-to-br from-zinc-950 via-zinc-900 to-stone-800 p-6 text-white shadow-sm md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-300">Relatórios gerenciais</p>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Leitura completa do sistema e do estoque</h1>
            <p className="max-w-2xl text-sm leading-7 text-zinc-300 md:text-base">
              Valores do estoque, evolução operacional, ordens de corte, geração e reaproveitamento de retalhos,
              clientes com chapas próprias e tendência do patrimônio em estoque ao longo do tempo.
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Select value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as ReportPeriod)}>
                <SelectTrigger className="w-full min-w-52 border-white/20 bg-white/10 text-white">
                  <SelectValue placeholder="Selecione um período" />
                </SelectTrigger>
                <SelectContent>
                  {PERIOD_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="secondary" className="border-white/20 bg-white/10 text-white hover:bg-white/20" onClick={handleExportCsv}>
                <Download className="h-4 w-4" />
                Exportar CSV
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Período</p>
                <p className="mt-2 text-lg font-semibold">{metrics.selectedPeriod.label}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Valor total</p>
                <p className="mt-2 text-2xl font-semibold">{formatCurrency(metrics.overview.totalStockValue)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Clientes cadastrados</p>
                <p className="mt-2 text-2xl font-semibold">{metrics.overview.totalClients}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="reports-period" className="grid grid-cols-1 gap-4 scroll-mt-24 md:grid-cols-2 xl:grid-cols-3">
        <ReportCard
          title={`Ordens em ${metrics.selectedPeriod.label.toLowerCase()}`}
          value={metrics.periodComparison.cutOrders}
          detail="Quantidade de ordens registradas no período selecionado."
          onClick={() => scrollToSection('reports-operational-trend')}
        />
        <ReportCard
          title="Chapas consumidas no período"
          value={metrics.periodComparison.sheetsConsumed}
          detail="Total de chapas padrão consumidas dentro do recorte selecionado."
          onClick={() => scrollToSection('reports-operational-trend')}
        />
        <ReportCard
          title="Retalhos gerados no período"
          value={metrics.periodComparison.scrapsGenerated}
          detail="Entradas de retalhos originadas por cortes no período escolhido."
          onClick={() => scrollToSection('reports-operational-trend')}
        />
        <ReportCard
          title="Retalhos reaproveitados no período"
          value={metrics.periodComparison.scrapsReused}
          detail="Saídas registradas diretamente sobre retalhos dentro do período filtrado."
          onClick={() => scrollToSection('reports-operational-trend')}
        />
        <ReportCard
          title="Valor total do estoque"
          value={formatCurrency(metrics.overview.totalStockValue)}
          detail="Somatório financeiro atual do estoque, independente do filtro temporal."
          onClick={() => scrollToSection('reports-stock-trend')}
        />
        <ReportCard
          title="Valor em retalhos"
          value={formatCurrency(metrics.overview.scrapStockValue)}
          detail="Parcela do patrimônio atual concentrada em retalhos reaproveitáveis."
          onClick={() => scrollToSection('reports-stock-trend')}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <Card className="border-zinc-200/80 bg-white shadow-sm">
          <CardHeader>
            <CardDescription>Ordens no período</CardDescription>
            <CardTitle className="text-3xl text-zinc-950">{metrics.periodComparison.cutOrders}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <MetricDeltaBadge value={metrics.periodComparison.cutOrdersComparedToPreviousPeriod} label="vs período anterior" />
            <p className="text-sm text-zinc-600">Comparação com a janela imediatamente anterior de mesmo tamanho.</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200/80 bg-white shadow-sm">
          <CardHeader>
            <CardDescription>Chapas consumidas</CardDescription>
            <CardTitle className="text-3xl text-zinc-950">{metrics.periodComparison.sheetsConsumed}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <MetricDeltaBadge value={metrics.periodComparison.sheetsConsumedComparedToPreviousPeriod} label="vs período anterior" />
            <p className="text-sm text-zinc-600">Soma das saídas em chapas padrão no período selecionado.</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200/80 bg-white shadow-sm">
          <CardHeader>
            <CardDescription>Retalhos gerados</CardDescription>
            <CardTitle className="text-3xl text-zinc-950">{metrics.periodComparison.scrapsGenerated}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <MetricDeltaBadge value={metrics.periodComparison.scrapsGeneratedComparedToPreviousPeriod} label="vs período anterior" />
            <p className="text-sm text-zinc-600">Entradas de retalhos originadas por ordens de corte nesse recorte.</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200/80 bg-white shadow-sm">
          <CardHeader>
            <CardDescription>Retalhos reaproveitados</CardDescription>
            <CardTitle className="text-3xl text-zinc-950">{metrics.periodComparison.scrapsReused}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <MetricDeltaBadge value={metrics.periodComparison.scrapsReusedComparedToPreviousPeriod} label="vs período anterior" />
            <p className="text-sm text-zinc-600">Saídas lançadas diretamente sobre retalhos no período filtrado.</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card id="reports-stock-trend" className="border-zinc-200/80 bg-white shadow-sm scroll-mt-24">
          <CardHeader>
            <CardDescription>Patrimônio em estoque ao longo do período filtrado</CardDescription>
            <CardTitle className="text-zinc-950">Evolução do valor do estoque</CardTitle>
          </CardHeader>
          <CardContent className="h-90">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.charts.stockValueTrend} margin={{ top: 12, right: 12, left: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="stockTotalFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f766e" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#0f766e" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={formatCompactCurrency} />
                <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Area type="monotone" dataKey="totalValue" name="Total" stroke="#0f766e" fill="url(#stockTotalFill)" strokeWidth={3} />
                <Line type="monotone" dataKey="standardValue" name="Chapas padrão" stroke="#f59e0b" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="scrapValue" name="Retalhos" stroke="#2563eb" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card id="reports-operational-trend" className="border-zinc-200/80 bg-white shadow-sm scroll-mt-24">
          <CardHeader>
            <CardDescription>{metrics.selectedPeriod.label}</CardDescription>
            <CardTitle className="text-zinc-950">Ordens, consumo e retalhos por faixa</CardTitle>
          </CardHeader>
          <CardContent className="h-90">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={metrics.charts.operationalTrend} margin={{ top: 12, right: 12, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="orders" name="Ordens" fill="#18181b" radius={[6, 6, 0, 0]} />
                <Line type="monotone" dataKey="scrapsGenerated" name="Retalhos gerados" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="scrapsReused" name="Retalhos reaproveitados" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card id="reports-materials" className="border-zinc-200/80 bg-white shadow-sm scroll-mt-24">
          <CardHeader>
            <CardDescription>Materiais com maior impacto operacional no período filtrado</CardDescription>
            <CardTitle className="text-zinc-950">Uso, geração e reaproveitamento por material</CardTitle>
          </CardHeader>
          <CardContent className="h-95">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.charts.materialPerformance} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="sheetsConsumed" name="Chapas utilizadas" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="scrapsGenerated" name="Retalhos gerados" fill="#ea580c" radius={[4, 4, 0, 0]} />
                <Bar dataKey="scrapsReused" name="Retalhos reaproveitados" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-zinc-200/80 bg-white shadow-sm">
          <CardHeader>
            <CardDescription>Acumulado do sistema</CardDescription>
            <CardTitle className="text-zinc-950">Totais consolidados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-sm text-zinc-500">Ordens de corte registradas</p>
              <p className="mt-2 text-2xl font-semibold text-zinc-950">{metrics.totals.totalCutOrders}</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-sm text-zinc-500">Chapas utilizadas</p>
              <p className="mt-2 text-2xl font-semibold text-zinc-950">{metrics.totals.totalSheetsConsumed}</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-sm text-zinc-500">Retalhos gerados</p>
              <p className="mt-2 text-2xl font-semibold text-zinc-950">{metrics.totals.totalScrapsGenerated}</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-sm text-zinc-500">Retalhos reaproveitados</p>
              <p className="mt-2 text-2xl font-semibold text-zinc-950">{metrics.totals.totalScrapsReused}</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-sm text-zinc-500">Clientes com chapas próprias movimentadas</p>
              <p className="mt-2 text-2xl font-semibold text-zinc-950">{metrics.totals.clientsWithOwnedSheetOrders}</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-sm text-zinc-500">SKUs com baixo estoque</p>
              <p className="mt-2 text-2xl font-semibold text-zinc-950">{metrics.overview.lowStockSheets}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card id="reports-clients" className="border-zinc-200/80 bg-white shadow-sm scroll-mt-24">
          <CardHeader>
            <CardDescription>Clientes vinculados a ordens em chapas próprias no período</CardDescription>
            <CardTitle className="text-zinc-950">Principais clientes por consumo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {metrics.topClients.length === 0 ? (
              <p className="text-sm text-zinc-500">Ainda não há clientes com movimentação de chapas próprias.</p>
            ) : (
              metrics.topClients.map((client) => (
                <div key={client.id} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-zinc-950">{client.name}</p>
                      <p className="mt-1 text-sm text-zinc-500">{client.cutOrders} ordens registradas</p>
                    </div>
                    <Badge variant="outline" className="border-zinc-200 bg-white text-zinc-700">
                      {client.sheetsConsumed} un. consumidas
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-200/80 bg-white shadow-sm">
          <CardHeader>
            <CardDescription>Mês atual</CardDescription>
            <CardTitle className="text-zinc-950">Resumo mensal da operação</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-sm text-zinc-500">Ordens no mês</p>
              <p className="mt-2 text-3xl font-semibold text-zinc-950">{metrics.monthlySnapshot.cutOrdersThisMonth}</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-sm text-zinc-500">Chapas consumidas</p>
              <p className="mt-2 text-3xl font-semibold text-zinc-950">{metrics.monthlySnapshot.sheetsConsumedThisMonth}</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-sm text-zinc-500">Retalhos gerados</p>
              <p className="mt-2 text-3xl font-semibold text-zinc-950">{metrics.monthlySnapshot.scrapsGeneratedThisMonth}</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-sm text-zinc-500">Retalhos reaproveitados</p>
              <p className="mt-2 text-3xl font-semibold text-zinc-950">{metrics.monthlySnapshot.scrapsReusedThisMonth}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="reports-recent" className="scroll-mt-24">
        <Card className="border-zinc-200/80 bg-white shadow-sm">
          <CardHeader>
            <CardDescription>Saídas recentes dentro do período filtrado</CardDescription>
            <CardTitle className="text-zinc-950">Histórico recente de saídas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.recentCutOrders.length === 0 ? (
              <p className="text-sm text-zinc-500">Sem saídas recentes para exibir.</p>
            ) : (
              metrics.recentCutOrders.map((movement) => (
                <div key={movement.id} className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-zinc-950">{movement.sheetSku}</p>
                      <Badge variant="outline" className="border-zinc-200 bg-white text-zinc-700">
                        {translateSheetType(movement.sheetType)}
                      </Badge>
                    </div>
                    <p className="text-sm text-zinc-600">
                      {movement.materialName}
                      {movement.clientName ? ` • ${movement.clientName}` : ' • Estoque próprio'}
                    </p>
                    <p className="text-sm text-zinc-500">
                      {movement.description?.trim() || 'Saída operacional registrada sem descrição adicional.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-600">
                    <Badge variant="outline" className="border-zinc-200 bg-white text-zinc-700">
                      {movement.quantity} un.
                    </Badge>
                    <span>{formatDate(movement.createdAt, true)}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}