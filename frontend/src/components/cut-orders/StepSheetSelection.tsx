'use client'

import { Sheet } from "@/types/sheet"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { SheetSelector } from "@/components/SheetSelector"

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
            <p className="text-xs text-zinc-500 mt-1">
              Disponíveis: {selectedSheet.quantity}
            </p>
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
