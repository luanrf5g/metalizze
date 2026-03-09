'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircleIcon } from "lucide-react"

type ProductivityData = { name: string; ordens: number }[]
type MaterialUsageData = { name: string; usadas: number; retalhos: number }[]

export default function ReportsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const [totalOrdersMonth, setTotalOrdersMonth] = useState(0)
  const [totalOrdersCompared, setTotalOrdersCompared] = useState(0)

  const [sheetsConsumedMonth, setSheetsConsumedMonth] = useState(0)
  const [sheetsConsumedCompared, setSheetsConsumedCompared] = useState(0)

  const [scrapsGeneratedMonth, setScrapsGeneratedMonth] = useState(0)
  const [scrapsGeneratedCompared, setScrapsGeneratedCompared] = useState(0)

  const [activeClients, setActiveClients] = useState(0)

  const [productivityData, setProductivityData] = useState<ProductivityData>([])
  const [materialUsageData, setMaterialUsageData] = useState<MaterialUsageData>([])

  useEffect(() => {
    async function fetchReportMetrics() {
      setIsLoading(true)
      setHasError(false)
      try {
        const response = await api.get('/metrics/reports')
        const metrics = response.data.metrics

        setTotalOrdersMonth(metrics.totalOrdersMonth)
        setTotalOrdersCompared(metrics.totalOrdersComparedToLastMonth)

        setSheetsConsumedMonth(metrics.sheetsConsumedMonth)
        setSheetsConsumedCompared(metrics.sheetsConsumedComparedToLastMonth)

        setScrapsGeneratedMonth(metrics.scrapsGeneratedMonth)
        setScrapsGeneratedCompared(metrics.scrapsGeneratedComparedToLastMonth)

        setActiveClients(metrics.activeClients)

        setProductivityData(metrics.productivityData)
        setMaterialUsageData(metrics.materialUsageData)
      } catch (error) {
        console.error("Erro ao buscar métricas de relatórios:", error)
        setHasError(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReportMetrics()
  }, [])

  function renderPercentageLabel(value: number) {
    if (value > 0) return <div className="text-xs text-green-800 font-medium">+{value}% comparado ao mês passado</div>
    if (value < 0) return <div className="text-xs text-red-800 font-medium">{value}% comparado ao mês passado</div>
    return <div className="text-xs text-zinc-700 font-medium">Estável comparado ao mês passado</div>
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 shrink-0 h-full">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="p-6 md:p-10">
        <Alert variant="destructive">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>
            Erro ao carregar as métricas do relatório. Tente novamente mais tarde.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full p-6 md:p-10 w-full mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-700">
      <div className="shrink-0 mb-2">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400 pb-1">
          Relatórios Gerenciais
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-base font-medium mt-2">
          Acompanhe os indicadores de produção, uso de chapas e eficiência do mês atual.
        </p>
      </div>

      <div className="shrink-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-yellow-100">Ordens (Mês Atual)</CardDescription>
            <CardTitle className="text-4xl">{totalOrdersMonth}</CardTitle>
          </CardHeader>
          <CardContent>
            {renderPercentageLabel(totalOrdersCompared)}
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-400 to-orange-600 text-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-orange-100">Chapas Consumidas</CardDescription>
            <CardTitle className="text-4xl">{sheetsConsumedMonth}</CardTitle>
          </CardHeader>
          <CardContent>
            {renderPercentageLabel(sheetsConsumedCompared)}
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-cyan-400 to-cyan-600 text-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-cyan-100">Retalhos Gerados</CardDescription>
            <CardTitle className="text-4xl">{scrapsGeneratedMonth}</CardTitle>
          </CardHeader>
          <CardContent>
            {renderPercentageLabel(scrapsGeneratedCompared)}
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-400 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-blue-100">Clientes Ativos</CardDescription>
            <CardTitle className="text-4xl">{activeClients}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs opacity-80">Total de cadastros no sistema</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card className="flex flex-col h-full overflow-hidden">
          <CardHeader className="shrink-0">
            <CardTitle>Uso de Materiais e Retalhos</CardTitle>
            <CardDescription>
              Comparativo estático entre quantidade total de chapas utilizadas e retalhos gerados.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={materialUsageData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip cursor={{ fill: '#f4f4f5' }} />
                <Legend />
                <Bar dataKey="usadas" name="Chapas Usadas" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                <Bar dataKey="retalhos" name="Retalhos" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="flex flex-col h-full overflow-hidden">
          <CardHeader className="shrink-0">
            <CardTitle>Produtividade dos Últimos 7 Dias</CardTitle>
            <CardDescription>
              Volume de ordens de corte processadas por dia na última semana.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={productivityData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip cursor={{ fill: '#f4f4f5' }} />
                <Line type="monotone" dataKey="ordens" name="Ordens Registradas" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div >
  )
}