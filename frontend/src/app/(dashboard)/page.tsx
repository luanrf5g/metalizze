'use client'

import { useEffect, useState } from 'react'
import { AlertCircleIcon, Factory, Layers, Loader2, PackageSearch, RectangleHorizontal, Scissors, Wallet } from 'lucide-react'
import { api } from '@/lib/api'
import { formatCurrency, formatDate, translateSheetType } from '@/lib/formatters'
import { useAuth } from '@/components/AuthProvider'
import { InventoryMovementChart } from '@/components/InventoryMovementChat'
import { MetricDeltaBadge } from '@/components/MetricDeltaBadge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type UserRole = 'ADMIN' | 'OPERATOR' | 'VIEWER'

interface DashboardMetrics {
  role: UserRole
  summary: {
    totalStandardSheets: number
    totalScrapSheets: number
    totalProfiles: number
    totalInventoryUnits: number
    totalMaterials: number
    totalClients: number
    totalStockValue: number | null
    standardStockValue: number
    scrapStockValue: number
    profileStockValue: number
    lowStockSheets: number
    ownedSheetsInStock: number
  }
  weekly: {
    cutOrdersCurrentWeek: number
    cutOrdersComparedToLastWeek: number
    sheetsConsumedCurrentWeek: number
    sheetsConsumedComparedToLastWeek: number
    scrapsGeneratedCurrentWeek: number
    scrapsGeneratedComparedToLastWeek: number
    scrapsReusedCurrentWeek: number
    scrapsReusedComparedToLastWeek: number
    clientsWithCutOrdersCurrentWeek: number
  }
  materialSnapshot: Array<{
    name: string
    standardSheets: number
    scrapSheets: number
    profiles: number
    stockValue: number
  }>
  clientsWithOwnedSheetOrders: Array<{
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

function normalizeDashboardMetrics(raw: any, role: UserRole = 'VIEWER'): DashboardMetrics {
  const summarySource = raw?.summary ?? raw ?? {}
  const weeklySource = raw?.weekly ?? {}

  return {
    role: raw?.role ?? role,
    summary: {
      totalStandardSheets: toNumber(summarySource.totalStandardSheets),
      totalScrapSheets: toNumber(summarySource.totalScrapSheets),
      totalProfiles: toNumber(summarySource.totalProfiles),
      totalInventoryUnits: toNumber(
        summarySource.totalInventoryUnits ??
        toNumber(summarySource.totalStandardSheets) + toNumber(summarySource.totalScrapSheets) + toNumber(summarySource.totalProfiles),
      ),
      totalMaterials: toNumber(summarySource.totalMaterials),
      totalClients: toNumber(summarySource.totalClients),
      totalStockValue: typeof summarySource.totalStockValue === 'number' ? summarySource.totalStockValue : null,
      standardStockValue: toNumber(summarySource.standardStockValue),
      scrapStockValue: toNumber(summarySource.scrapStockValue),
      profileStockValue: toNumber(summarySource.profileStockValue),
      lowStockSheets: toNumber(summarySource.lowStockSheets),
      ownedSheetsInStock: toNumber(summarySource.ownedSheetsInStock),
    },
    weekly: {
      cutOrdersCurrentWeek: toNumber(weeklySource.cutOrdersCurrentWeek),
      cutOrdersComparedToLastWeek: toNumber(weeklySource.cutOrdersComparedToLastWeek),
      sheetsConsumedCurrentWeek: toNumber(weeklySource.sheetsConsumedCurrentWeek),
      sheetsConsumedComparedToLastWeek: toNumber(weeklySource.sheetsConsumedComparedToLastWeek),
      scrapsGeneratedCurrentWeek: toNumber(weeklySource.scrapsGeneratedCurrentWeek),
      scrapsGeneratedComparedToLastWeek: toNumber(weeklySource.scrapsGeneratedComparedToLastWeek),
      scrapsReusedCurrentWeek: toNumber(weeklySource.scrapsReusedCurrentWeek),
      scrapsReusedComparedToLastWeek: toNumber(weeklySource.scrapsReusedComparedToLastWeek),
      clientsWithCutOrdersCurrentWeek: toNumber(weeklySource.clientsWithCutOrdersCurrentWeek),
    },
    materialSnapshot: Array.isArray(raw?.materialSnapshot) ? raw.materialSnapshot : [],
    clientsWithOwnedSheetOrders: Array.isArray(raw?.clientsWithOwnedSheetOrders) ? raw.clientsWithOwnedSheetOrders : [],
    recentCutOrders: Array.isArray(raw?.recentCutOrders) ? raw.recentCutOrders : [],
  }
}

function OverviewCard({
  title,
  value,
  description,
  icon: Icon,
  onClick,
}: {
  title: string
  value: string | number
  description: string
  icon: React.ComponentType<{ className?: string }>
  onClick?: () => void
}) {
  return (
    <button type="button" onClick={onClick} className="text-left">
      <Card className="border-zinc-200/80 bg-white shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardDescription className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                {title}
              </CardDescription>
              <CardTitle className="mt-3 text-3xl font-semibold text-zinc-950">{value}</CardTitle>
            </div>
            <div className="rounded-2xl bg-linear-to-br from-zinc-950 via-zinc-900 to-stone-800 p-3 text-white shadow-sm">
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-zinc-600">{description}</p>
        </CardContent>
      </Card>
    </button>
  )
}

export default function DashboardPage() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  function scrollToSection(sectionId: string) {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    async function fetchMetrics() {
      try {
        setHasError(false)
        const response = await api.get('/metrics/cards')
        setMetrics(normalizeDashboardMetrics(response.data.metrics, user?.role ?? 'VIEWER'))
      } catch (error) {
        console.error('Erro ao buscar métricas do dashboard:', error)
        setHasError(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMetrics()
  }, [user?.role])

  if (isAuthLoading || isLoading) {
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
          <AlertTitle>Erro ao carregar o dashboard</AlertTitle>
          <AlertDescription>
            Não foi possível buscar os indicadores operacionais do sistema neste momento.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const isAdmin = user?.role === 'ADMIN'

  return (
    <div className="w-full space-y-8 p-6 md:p-10">
      <section className="rounded-[2rem] border border-zinc-200 bg-linear-to-br from-zinc-950 via-zinc-900 to-stone-800 p-6 text-white shadow-sm md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-300">Operação e inventário</p>
            <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
              Dashboard
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-zinc-300 md:text-base">
              Visão consolidada do estoque, consumo de chapas, geração de retalhos e clientes que estão
              movimentando chapas próprias nesta semana.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Itens em estoque</p>
              <p className="mt-2 text-2xl font-semibold text-white">{metrics.summary.totalInventoryUnits}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Ordens na semana</p>
              <p className="mt-2 text-2xl font-semibold text-white">{metrics.weekly.cutOrdersCurrentWeek}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Clientes com corte próprio</p>
              <p className="mt-2 text-2xl font-semibold text-white">{metrics.weekly.clientsWithCutOrdersCurrentWeek}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 1xl:grid-cols-5">
        <OverviewCard
          title="Chapas padrão disponíveis"
          value={metrics.summary.totalStandardSheets}
          description="Quantidade total de chapas originais disponíveis para corte e consumo operacional."
          icon={Layers}
          onClick={() => scrollToSection('dashboard-materials')}
        />

        <OverviewCard
          title="Retalhos disponíveis"
          value={metrics.summary.totalScrapSheets}
          description="Volume aproveitável de retalhos já registrado no estoque atual."
          icon={Scissors}
          onClick={() => scrollToSection('dashboard-materials')}
        />

        <OverviewCard
          title="Perfis disponíveis"
          value={metrics.summary.totalProfiles}
          description="Quantidade total de perfis (barras) disponíveis no estoque."
          icon={RectangleHorizontal}
          onClick={() => scrollToSection('dashboard-materials')}
        />

        <OverviewCard
          title={isAdmin ? 'Valor total do estoque' : 'Ordens de corte na semana'}
          value={isAdmin ? formatCurrency(metrics.summary.totalStockValue ?? 0) : metrics.weekly.cutOrdersCurrentWeek}
          description={
            isAdmin
              ? 'Somatório financeiro de chapas, retalhos e perfis atualmente disponíveis.'
              : 'Quantidade de registros de corte e utilização feitos sobre chapas padrão nesta semana.'
          }
          icon={isAdmin ? Wallet : Factory}
          onClick={() => scrollToSection('dashboard-weekly')}
        />

        <OverviewCard
          title="SKUs em atenção"
          value={metrics.summary.lowStockSheets}
          description="Modelos com saldo baixo e maior risco de faltar durante a operação."
          icon={PackageSearch}
          onClick={() => scrollToSection('dashboard-recent')}
        />
      </section>

      <section id="dashboard-weekly" className="grid grid-cols-1 gap-4 2lg:grid-cols-2 2xl:grid-cols-4 scroll-mt-24">
        <Card className="border-zinc-200/80 bg-linear-to-br from-zinc-950 via-zinc-900 to-stone-800 text-white shadow-sm 2xl:col-span-2">
          <CardHeader>
            <CardDescription className="text-zinc-300">Ritmo da semana</CardDescription>
            <CardTitle className="text-2xl text-white">Consumo e reaproveitamento</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-zinc-300">Chapas consumidas</p>
                  <p className="mt-2 text-3xl font-semibold">{metrics.weekly.sheetsConsumedCurrentWeek}</p>
                </div>
                <MetricDeltaBadge value={metrics.weekly.sheetsConsumedComparedToLastWeek} label="vs semana passada" />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-zinc-300">Retalhos gerados</p>
                  <p className="mt-2 text-3xl font-semibold">{metrics.weekly.scrapsGeneratedCurrentWeek}</p>
                </div>
                <MetricDeltaBadge value={metrics.weekly.scrapsGeneratedComparedToLastWeek} label="vs semana passada" />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-zinc-300">Retalhos reaproveitados</p>
                  <p className="mt-2 text-3xl font-semibold">{metrics.weekly.scrapsReusedCurrentWeek}</p>
                </div>
                <MetricDeltaBadge value={metrics.weekly.scrapsReusedComparedToLastWeek} label="vs semana passada" />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-zinc-300">Clientes com corte em chapas próprias</p>
                  <p className="mt-2 text-3xl font-semibold">{metrics.weekly.clientsWithCutOrdersCurrentWeek}</p>
                </div>
                <MetricDeltaBadge value={metrics.weekly.cutOrdersComparedToLastWeek} label="vs semana passada" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200/80 bg-white shadow-sm 2xl:col-span-2">
          <CardHeader>
            <CardDescription>Carteira e capacidade atual</CardDescription>
            <CardTitle className="text-zinc-950">Cobertura de estoque disponível</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-sm text-zinc-500">Materiais ativos em estoque</p>
              <p className="mt-2 text-3xl font-semibold text-zinc-950">{metrics.summary.totalMaterials}</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-sm text-zinc-500">Clientes com chapas em estoque</p>
              <p className="mt-2 text-3xl font-semibold text-zinc-950">{metrics.summary.totalClients}</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-sm text-zinc-500">Unidades ligadas a clientes</p>
              <p className="mt-2 text-3xl font-semibold text-zinc-950">{metrics.summary.ownedSheetsInStock}</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-sm text-zinc-500">Saldo geral disponível</p>
              <p className="mt-2 text-3xl font-semibold text-zinc-950">{metrics.summary.totalInventoryUnits}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <InventoryMovementChart />

      <section id="dashboard-materials" className="grid grid-cols-1 gap-6 lg:grid-cols-2 scroll-mt-24">
        <Card className="border-zinc-200/80 bg-white shadow-sm">
          <CardHeader>
            <CardDescription>Inventário por material</CardDescription>
            <CardTitle className="text-zinc-950">Materiais com maior presença no estoque</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {metrics.materialSnapshot.length === 0 ? (
              <p className="text-sm text-zinc-500">Nenhum material com saldo disponível para exibir.</p>
            ) : (
              metrics.materialSnapshot.map((material) => (
                <div key={material.name} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-base font-semibold text-zinc-950">{material.name}</p>
                      <p className="mt-1 text-sm text-zinc-500">
                        {material.standardSheets} chapas padrão, {material.scrapSheets} retalhos{material.profiles > 0 ? ` e ${material.profiles} perfis` : ''} disponíveis
                      </p>
                    </div>
                    {isAdmin ? (
                      <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">
                        {formatCurrency(material.stockValue)}
                      </Badge>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-200/80 bg-white shadow-sm">
          <CardHeader>
            <CardDescription>Clientes com chapas próprias movimentadas</CardDescription>
            <CardTitle className="text-zinc-950">Quem está consumindo estoque do cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {metrics.clientsWithOwnedSheetOrders.length === 0 ? (
              <p className="text-sm text-zinc-500">Ainda não há ordens sobre chapas vinculadas a clientes.</p>
            ) : (
              metrics.clientsWithOwnedSheetOrders.map((client) => (
                <div key={client.id} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-zinc-950">{client.name}</p>
                      <p className="mt-1 text-sm text-zinc-500">{client.cutOrders} ordens registradas em chapas do cliente</p>
                    </div>
                    <Badge variant="outline" className="border-zinc-200 bg-white text-zinc-700">
                      {client.sheetsConsumed} consumidas
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <section id="dashboard-recent" className="scroll-mt-24">
        <Card className="border-zinc-200/80 bg-white shadow-sm">
          <CardHeader>
            <CardDescription>Últimas saídas registradas</CardDescription>
            <CardTitle className="text-zinc-950">Ordens e utilizações recentes</CardTitle>
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