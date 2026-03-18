'use client'

import { api } from "@/lib/api"
import { Sheet } from "@/types/sheet"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { SheetSelector } from "./SheetSelector"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { AlertTriangle } from "lucide-react"

interface CreateMovementModalProps {
  onSuccess: () => void
}

export function CreateMovementModal({ onSuccess }: CreateMovementModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [sheets, setSheets] = useState<Sheet[]>([])

  const [sheetId, setSheetId] = useState("")
  const [selectedSheet, setSelectedSheet] = useState<Sheet | null>(null)
  const [type, setType] = useState<"ENTRY" | "EXIT">("ENTRY")
  const [quantity, setQuantity] = useState("")
  const [description, setDescription] = useState("")

  async function handleCreateMovement(e: React.ChangeEvent) {
    e.preventDefault()
    setIsLoading(true)
    try {
      await api.post('/movements', {
        sheetId,
        type,
        quantity: Number(quantity),
        description
      })

      setSheetId("")
      setType('ENTRY'),
      setQuantity("")
      setDescription("")
      onSuccess()
      toast.success('Movimentação registrada com sucesso!')
    } catch (error) {
      console.error('Erro ao tentar register movimentação: ', error)
      toast.error('Erro ao tentar registrar movimentação no inventário.')
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchSheets() {
    try {
      // Tenta usar o endpoint completo de seleção
      const response = await api.get('/sheets/all')
      setSheets(response.data.sheets)
    } catch (error) {
      const anyError = error as any

      // Fallback: se /sheets/all não existir, tenta o endpoint paginado padrão
      if (anyError?.response?.status === 404) {
        try {
          const fallbackResponse = await api.get('/sheets')
          setSheets(fallbackResponse.data.sheets || [])
          return
        } catch (fallbackError) {
          console.error('Erro ao buscar chapas no endpoint de fallback /sheets.', fallbackError)
        }
      }

      console.error('Erro ao buscar chapas.', error)
      toast.error('Erro ao tentar buscar as chapas disponíveis.')
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)

        if (isOpen && sheets.length === 0) {
          fetchSheets()
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="hover:cursor-pointer">Registrar Movimentação</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogTitle>Registrar Movimentação</DialogTitle>
        <DialogDescription>
          Registre uma nova movimentação no inventário.
        </DialogDescription>

        <form onSubmit={handleCreateMovement} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Chapa</Label>
            <SheetSelector
              sheets={sheets}
              selectedSheetId={sheetId}
              onSelectSheet={(id) => {
                setSheetId(id)
                const sheet = sheets.find((s) => s.id === id) ?? null
                setSelectedSheet(sheet)

                // Se a chapa selecionada não tiver estoque, força o tipo para ENTRADA
                if (sheet && sheet.quantity === 0) {
                  setType("ENTRY")
                }
              }}
            />
            {selectedSheet && (
              <>
                <p className="text-xs text-zinc-500 mt-1">
                  Disponíveis: {selectedSheet.quantity}
                </p>
                {selectedSheet.quantity === 0 && (
                  <div className="mt-2 flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                    <AlertTriangle className="h-4 w-4 mt-0.5 text-amber-500" />
                    <p>
                      Esta chapa está com <span className="font-semibold">0 unidades em estoque</span>.
                      Apenas movimentações de <span className="font-semibold">entrada</span> são permitidas;
                      o tipo <span className="font-semibold">saída</span> foi desabilitado.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Inputs for Type and Quantity */}
          <div className="flex items-center justify-between">
            {/* Input for type */}
            <div className="space-y-2">
              <Label>Tipo da Movimentação</Label>
              <Select
                value={type}
                onValueChange={(value) => setType(value as "ENTRY" | "EXIT")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder='Tipo da Movimentação'/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key='ENTRY' value='ENTRY'>
                    Entrada
                  </SelectItem>
                  <SelectItem
                    key='EXIT'
                    value='EXIT'
                    disabled={selectedSheet?.quantity === 0}
                  >
                    Saída
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Input for Quantity */}
            <div className="space-y-2">
              <Label>Quantidade</Label>
              <Input
                id='quantity'
                type='number'
                placeholder="Quantidade"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descrição da Movimentação</Label>
            <Textarea
              id="description"
              placeholder="Digite a descrição do movimento..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant={'outline'}
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="hover:cursor-pointer"
              onClick={() => setOpen(false)}
            >
              {isLoading ? 'Registrando...' : 'Registrar Movimento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}