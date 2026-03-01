'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { Scissors } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function CutOrdersPage() {
  const [motherSheetId, setMotherSheetId] = useState('')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [thickness, setThickness] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      await api.post('/sheets/cut', {
        motherSheetId,
        width: Number(width),
        height: Number(height),
        thickness: Number(thickness),
        quantity: Number(quantity),
      })

      toast.success('Ordem de corte registrada com sucesso!')
      setMotherSheetId('')
      setWidth('')
      setHeight('')
      setThickness('')
      setQuantity('1')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao registrar ordem de corte.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-8 max-x-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ordens de Corte</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Registre cortes em chapas existentes. Um retalho será gerado automaticamente.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Scissors className="w-5 h-5" />
            Nova Ordem de Corte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Chapa Mãe (ID)</Label>
              <Input
                value={motherSheetId}
                onChange={(e) => setMotherSheetId(e.target.value)}
                placeholder="ID da chapa original"
                required
              />
              <p className="text-xs text-zinc-400">
                Cole o ID da chapa que será cortada. Consulte o estoque para encontrar o ID.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Largura (mm)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Altura (mm)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Espessura (mm)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={thickness}
                  onChange={(e) => setThickness(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Quantidade</Label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full bg-zinc-900 hover:bg-zinc-800 text-white cursor-pointer" disabled={isLoading}>
              {isLoading ? 'Registrando...' : 'Registrar Corte'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}