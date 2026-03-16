'use client'

import { useEffect, useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { InventoryMetrics } from "@/types/inventory-metrics"
import { api } from "@/lib/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

const chartConfig = {
  entries: {
    label: "Entradas",
    // Verde para entradas
    color: "#16a34a",
  },
  exits: {
    label: "Saídas",
    // Vermelho para saídas
    color: "#ef4444",
  },
} satisfies ChartConfig

export function InventoryMovementChart() {
  const [timeRange, setTimeRange] = useState("90d")

  const [isLoading, setIsLoading] = useState(true)
  const [metrics, setMetrics] = useState<InventoryMetrics[]>([])

  const filteredData = metrics.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date()

    let daysToSubtract = 90
    if (timeRange === '30d') {
      daysToSubtract = 30
    } else if (timeRange === '7d') {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  async function fetchInventoryMetrics() {
    setIsLoading(true)
    try {
      const response = await api.get('/metrics/inventory-movements')
      setMetrics(response.data.metrics)
    } catch (error) {
      console.log('Erro ao tentar recuperar os dados do inventário: ', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchInventoryMetrics()
  }, [])

  return (
    <Card className="col-span-1 md:col-span-4 lg:col-span-4 mt-4">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-8">
        <div>
          <CardTitle>Movimentação de Inventário</CardTitle>
          <CardDescription>Entradas vs Saídas de chapas.</CardDescription>
        </div>

        {/* Botões de Filtro Iguais aos da sua imagem */}
        <div className="flex p-1 rounded-md mt-4 sm:mt-0">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="hidden w-40 rounded-lg sm:ml-auto sm:flex"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Últimos 3 meses" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Últimos 3 meses
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Últimos 30 dias
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Últimos 7 dias
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex w-full items-center justify-center">
            <span className="text-md text-zinc-600">Carregando dados...</span>
          </div>
        ) : metrics.length === 0 ? (
          <div className="flex w-full items-center justify-center">
            <span className="text-md text-zinc-600">
              Sem dados para construir o gráfico.
            </span>
          </div>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="h-75 w-full">
              {/* ResponsiveContainer garante que o gráfico se adapte à tela */}
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredData} margin={{ top: 10, left: 16, right: 16, bottom: 0 }}>

                {/* Definição dos Gradientes (O escurecimento embaixo da linha) */}
                <defs>
                  <linearGradient id="fillEntry" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-entries)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--color-entries)" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="fillExit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-exits)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--color-exits)" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>

                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  allowDecimals={false}
                  width={30}
                  className="text-xs text-muted-foreground"
                />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  interval="preserveStartEnd"
                  tickFormatter={(value ) => {
                    const date = new Date(value)
                    return date.toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short'
                    })
                  }}
                  className="text-xs text-muted-foreground"
                />
                <ChartTooltip
                  cursor
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => {
                        return new Date(value).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short'
                        })
                      }}
                      indicator="dot"
                    />
                  }
                />

                <Area
                  dataKey="entries"
                  type="monotone"
                  fill="url(#fillEntry)"
                  stroke="none"
                />
                <Area
                  dataKey="exits"
                  type="monotone"
                  fill="url(#fillExit)"
                  stroke="none"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>

            <div className="mt-3 flex items-center justify-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 ">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: chartConfig.entries.color }}
                />
                <span className="text-muted-foreground">{chartConfig.entries.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: chartConfig.exits.color }}
                />
                <span className="text-muted-foreground">{chartConfig.exits.label}</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}