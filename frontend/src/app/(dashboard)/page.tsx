'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Layers, Scissors, Box, Users, Wallet } from "lucide-react"
import { api } from "@/lib/api"
import { InventoryMovementChart } from "@/components/InventoryMovementChat"
import { formatCurrency } from "@/lib/formatters"

// Tipagem do retorno da nossa rota /metrics
interface DashboardMetrics {
  totalStandardSheets: number;
  totalScrapSheets: number;
  totalMaterials: number;
  totalClients: number;
  totalStockValue: number;
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  async function fetchMetrics() {
    try {
      const response = await api.get('/metrics/cards')
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
    <div className="p-6 md:p-10 w-full mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Cabeçalho da Página */}
      <div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-br from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400 pb-1">
          Dashboard
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-base font-medium mt-2">
          Visão geral do seu estoque e cadastros.
        </p>
      </div>

      {/* Grid dos Cards (1 coluna no celular, 2 no tablet, 4 no monitor) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Card 1: Chapas Originais */}
        <Card className="bg-linear-to-br from-yellow-400 to-yellow-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Chapas em Estoque
            </CardTitle>
            <Layers className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : metrics?.totalStandardSheets}
            </div>
            <p className="text-xs opacity-80 mt-1">
              Quantidade de chapas inteiras
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Retalhos (Scraps) */}
        <Card className="bg-linear-to-br from-orange-400 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Retalhos Disponíveis
            </CardTitle>
            <Scissors className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : metrics?.totalScrapSheets}
            </div>
            <p className="text-xs opacity-80 mt-1">
              Pedaços para reaproveitamento
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Valor Total do Estoque */}
        <Card className="bg-linear-to-br from-green-400 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Valor Total do Estoque
            </CardTitle>
            <Wallet className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : formatCurrency(metrics?.totalStockValue ?? 0)}
            </div>
            <p className="text-xs opacity-80 mt-1">
              Soma do valor de todas as chapas em estoque
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Clientes */}
        <Card className="bg-linear-to-br from-blue-400 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Clientes Ativos
            </CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : metrics?.totalClients}
            </div>
            <p className="text-xs opacity-80 mt-1">
              Carteira de clientes registrados
            </p>
          </CardContent>
        </Card>
      </div>
        <InventoryMovementChart/>
    </div>
  )
}