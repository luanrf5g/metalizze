'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Layers, Scissors, Box, Users } from "lucide-react"
import { api } from "@/lib/api"
import { InventoryMovementChart } from "@/components/InventoryMovementChat"

interface DashboardMetrics {
  totalStandardSheets: number;
  totalScrapSheets: number;
  totalMaterials: number;
  totalClients: number;
}

export default function ReportsPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  async function fetchMetrics() {
    try {
      const response = await api.get('/metrics/cards')
      setMetrics(response.data.metrics)
    } catch (error) {
      console.error("Erro ao buscar métricas:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
  }, [])

  return (
    <div className="p-8 max-x-8xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Relatórios</h1>
        <p className="text-muted-foreground mt-1">
          Análise consolidada do estoque e operações.
        </p>
      </div>

      {/* Resumo em Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-zinc-600">
              Total Chapas
            </CardTitle>
            <Layers className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : metrics?.totalStandardSheets}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Chapas inteiras em estoque
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-zinc-600">
              Total Retalhos
            </CardTitle>
            <Scissors className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : metrics?.totalScrapSheets}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Retalhos disponíveis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-zinc-600">
              Materiais
            </CardTitle>
            <Box className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : metrics?.totalMaterials}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tipos cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-zinc-600">
              Clientes
            </CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : metrics?.totalClients}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Clientes cadastrados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Movimentações */}
      <InventoryMovementChart />
    </div>
  )
}