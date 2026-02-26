'use client'

import { useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"

// Dados falsos só para você ver o visual hoje. Depois o seu backend vai cuspir isso!
const chartData = [
  { date: "Jun 23", entry: 45, exit: 20 },
  { date: "Jun 24", entry: 52, exit: 15 },
  { date: "Jun 25", entry: 38, exit: 40 },
  { date: "Jun 26", entry: 65, exit: 30 },
  { date: "Jun 27", entry: 40, exit: 25 },
  { date: "Jun 28", entry: 55, exit: 45 },
  { date: "Jun 29", entry: 70, exit: 35 },
]

const chartConfig = {
  entry: {
    label: "Entradas (Chapas)",
    color: "hsl(160, 100%, 37%)", // O shadcn injeta essas cores no seu globals.css
  },
  exit: {
    label: "Saídas (Cortes)",
    color: "hsl(345, 100%, 56%)",
  },
} satisfies ChartConfig

type TimeFilter = '7days' | '30days' | '3months' | '12months'

export function InventoryMovementChart() {
  const [activeFilter, setActiveFilter] = useState<TimeFilter>('7days')

  return (
    <Card className="col-span-1 md:col-span-4 lg:col-span-4 mt-4">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-8">
        <div>
          <CardTitle>Movimentação de Inventário</CardTitle>
          <CardDescription>Entradas vs Saídas de chapas no período</CardDescription>
        </div>

        {/* Botões de Filtro Iguais aos da sua imagem */}
        <div className="flex bg-zinc-100/50 p-1 rounded-md border mt-4 sm:mt-0">
          <Button
            variant={activeFilter === '7days' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveFilter('7days')}
            className="text-xs"
          >
            Últimos 7 dias
          </Button>
          <Button
            variant={activeFilter === '30days' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveFilter('30days')}
            className="text-xs"
          >
            Últimos 30 dias
          </Button>
          <Button
            variant={activeFilter === '3months' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveFilter('3months')}
            className="text-xs"
          >
            Últimos 3 meses
          </Button>
          <Button
            variant={activeFilter === '12months' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveFilter('12months')}
            className="text-xs"
          >
            12 meses
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          {/* ResponsiveContainer garante que o gráfico se adapte à tela */}
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, left: 0, right: 0, bottom: 0 }}>

              {/* Definição dos Gradientes (O escurecimento embaixo da linha) */}
              <defs>
                <linearGradient id="fillEntry" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-entry)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--color-entry)" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="fillExit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-exit)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--color-exit)" stopOpacity={0.1}/>
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-xs text-muted-foreground"
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />

              {/* type="monotone" é o que deixa a curva suave igual na sua foto */}
              <Area
                type="monotone"
                dataKey="exit"
                stroke="var(--color-exit)"
                fillOpacity={1}
                fill="url(#fillExit)"
              />
              <Area
                type="monotone"
                dataKey="entry"
                stroke="var(--color-entry)"
                fillOpacity={1}
                fill="url(#fillEntry)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}