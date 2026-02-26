'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Layers, Scissors, Box, Users } from "lucide-react"
import { api } from "@/lib/api"

// Tipagem do retorno da nossa rota /metrics
interface DashboardMetrics {
  totalStandardSheets: number;
  totalScrapsSheets: number;
  totalMaterials: number;
  totalClients: number;
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  async function fetchMetrics() {
    try {
      const response = await api.get('/metrics')
      setMetrics(response.data.metrics)
    } catch (error) {
      console.error("Erro ao buscar métricas do dashboard:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
  }, [])

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">

      {/* Cabeçalho da Página */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Visão geral do seu estoque e cadastros.
        </p>
      </div>

      {/* Grid dos Cards (1 coluna no celular, 2 no tablet, 4 no monitor) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Card 1: Chapas Originais */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-zinc-600">
              Chapas em Estoque
            </CardTitle>
            <Layers className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : metrics?.totalStandardSheets}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Quantidade de chapas inteiras
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Retalhos (Scraps) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-zinc-600">
              Retalhos Disponíveis
            </CardTitle>
            <Scissors className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : metrics?.totalScrapsSheets}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Pedaços para reaproveitamento
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Materiais */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-zinc-600">
              Tipos de Material
            </CardTitle>
            <Box className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : metrics?.totalMaterials}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Materiais cadastrados no sistema
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Clientes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-zinc-600">
              Clientes Ativos
            </CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : metrics?.totalClients}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Carteira de clientes registrados
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}