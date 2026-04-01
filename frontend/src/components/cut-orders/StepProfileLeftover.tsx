'use client'

import { Profile } from "@/types/profile"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"

export interface LeftoverForm {
  length: string
  quantity: string
}

interface StepProfileLeftoverProps {
  selectedProfile: Profile | null
  hasLeftover: boolean
  leftovers: LeftoverForm[]
  onToggleLeftover: () => void
  onAddLeftover: () => void
  onRemoveLeftover: (index: number) => void
  onUpdateLeftover: (index: number, field: keyof LeftoverForm, value: string) => void
}

export function StepProfileLeftover({
  selectedProfile,
  hasLeftover,
  leftovers,
  onToggleLeftover,
  onAddLeftover,
  onRemoveLeftover,
  onUpdateLeftover,
}: StepProfileLeftoverProps) {
  return (
    <div className="w-full flex-shrink-0 p-6 space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">Sobra de Material</h2>
        <p className="text-sm text-zinc-500 mt-0.5">
          Informe se houve sobra de comprimento após o corte.
        </p>
      </div>

      {/* Toggle */}
      <div
        className="flex items-center justify-between p-4 rounded-lg border border-zinc-200 bg-zinc-50 cursor-pointer select-none"
        onClick={onToggleLeftover}
      >
        <div>
          <p className="text-sm font-medium text-zinc-900">Sobrou material?</p>
          <p className="text-xs text-zinc-500">
            Marque se o corte resultou em sobras aproveitáveis.
            {selectedProfile && (
              <span className="block mt-0.5">
                Comprimento original: <span className="font-semibold">{selectedProfile.length}mm</span>
              </span>
            )}
          </p>
        </div>
        <div
          className={`
            w-11 h-6 rounded-full flex items-center p-0.5 transition-colors duration-300 cursor-pointer
            ${hasLeftover ? "bg-zinc-900" : "bg-zinc-300"}
          `}
        >
          <div
            className={`
              w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300
              ${hasLeftover ? "translate-x-5" : "translate-x-0"}
            `}
          />
        </div>
      </div>

      {/* Leftover entries */}
      {hasLeftover && (
        <div className="space-y-3">
          <div className="flex items-center justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1 text-xs"
              onClick={onAddLeftover}
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar
            </Button>
          </div>

          {leftovers.map((leftover, index) => (
            <div key={index} className="p-4 border border-zinc-200 rounded-lg bg-white flex items-end gap-3">
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs">Quantidade</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="Ex: 1"
                  value={leftover.quantity}
                  onChange={(e) => onUpdateLeftover(index, 'quantity', e.target.value)}
                />
              </div>
              <div className="flex-[2] space-y-1.5">
                <Label className="text-xs">Comprimento (mm)</Label>
                <Input
                  type="number"
                  min="1"
                  max={selectedProfile ? selectedProfile.length - 1 : undefined}
                  placeholder={`Ex: ${selectedProfile ? Math.round(selectedProfile.length / 2) : '3000'}`}
                  value={leftover.length}
                  onChange={(e) => onUpdateLeftover(index, 'length', e.target.value)}
                />
              </div>
              {leftovers.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-zinc-400 hover:text-red-500"
                  onClick={() => onRemoveLeftover(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
