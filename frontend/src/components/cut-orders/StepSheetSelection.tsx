'use client'

import { Sheet } from "@/types/sheet"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { SheetSelector } from "@/components/SheetSelector"
import { AlertTriangle } from "lucide-react"

interface StepSheetSelectionProps {
  sheets: Sheet[]
  sheetId: string
  selectedSheet: Sheet | null
  quantity: string
  description: string
  onSelectSheet: (id: string) => void
  onQuantityChange: (value: string) => void
  onDescriptionChange: (value: string) => void
}

export function StepSheetSelection({
  sheets,
  sheetId,
  selectedSheet,
  quantity,
  description,
  onSelectSheet,
  onQuantityChange,
  onDescriptionChange,
}: StepSheetSelectionProps) {
  return (
    <div className="w-full flex-shrink-0 p-6 space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">Selecionar Chapa</h2>
        <p className="text-sm text-zinc-500 mt-0.5">
          Escolha a chapa que será utilizada no corte.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Chapa (SKU)</Label>
          <SheetSelector
            sheets={sheets}
            selectedSheetId={sheetId}
            onSelectSheet={onSelectSheet}
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
                    Verifique se deseja realmente utilizá-la para esta ordem de corte.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="space-y-2">
          <Label>Quantidade a utilizar</Label>
          <Input
            type="number"
            min="1"
            placeholder="Ex: 2"
            value={quantity}
            onChange={(e) => onQuantityChange(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Descrição do movimento</Label>
          <Textarea
            placeholder="Descreva o motivo do corte..."
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            className="min-h-20 resize-none bg-white"
          />
        </div>
      </div>
    </div>
  )
}
