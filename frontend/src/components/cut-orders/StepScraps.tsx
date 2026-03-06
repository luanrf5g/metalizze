'use client'

import { Client } from "@/types/clients"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"

export interface ScrapForm {
  width: string
  height: string
  quantity: string
  clientId: string
}

interface StepScrapsProps {
  hasScraps: boolean
  scraps: ScrapForm[]
  clients: Client[]
  onToggleScraps: () => void
  onAddScrap: () => void
  onRemoveScrap: (index: number) => void
  onUpdateScrap: (index: number, field: keyof ScrapForm, value: string) => void
}

export function StepScraps({
  hasScraps,
  scraps,
  clients,
  onToggleScraps,
  onAddScrap,
  onRemoveScrap,
  onUpdateScrap,
}: StepScrapsProps) {
  return (
    <div className="w-full flex-shrink-0 p-6 space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">Retalhos</h2>
        <p className="text-sm text-zinc-500 mt-0.5">
          Informe se serão gerados retalhos a partir do corte.
        </p>
      </div>

      {/* Toggle */}
      <div
        className="flex items-center justify-between p-4 rounded-lg border border-zinc-200 bg-zinc-50 cursor-pointer select-none"
        onClick={onToggleScraps}
      >
        <div>
          <p className="text-sm font-medium text-zinc-900">Gerar retalhos?</p>
          <p className="text-xs text-zinc-500">Marque se o corte resultará em retalhos.</p>
        </div>
        <div
          className={`
            w-11 h-6 rounded-full flex items-center p-0.5 transition-colors duration-300 cursor-pointer
            ${hasScraps ? "bg-zinc-900" : "bg-zinc-300"}
          `}
        >
          <div
            className={`
              w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300
              ${hasScraps ? "translate-x-5" : "translate-x-0"}
            `}
          />
        </div>
      </div>

      {/* Scraps list */}
      {hasScraps && (
        <div className="space-y-4">
          {scraps.map((scrap, index) => (
            <div
              key={index}
              className="p-4 border border-zinc-200 rounded-lg space-y-3 bg-white relative"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-700">
                  Retalho {index + 1}
                </span>
                {scraps.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onRemoveScrap(index)}
                    className="text-zinc-400 hover:text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Largura (mm)</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Ex: 500"
                    value={scrap.width}
                    onChange={(e) => onUpdateScrap(index, "width", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Altura (mm)</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Ex: 300"
                    value={scrap.height}
                    onChange={(e) => onUpdateScrap(index, "height", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Quantidade</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Ex: 1"
                    value={scrap.quantity}
                    onChange={(e) => onUpdateScrap(index, "quantity", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Cliente</Label>
                <Select
                  value={scrap.clientId}
                  onValueChange={(val) => onUpdateScrap(index, "clientId", val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectGroup>
                      <SelectLabel>Cliente</SelectLabel>
                      <SelectItem value="none">Estoque Próprio</SelectItem>
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={c.id} className="hover:cursor-pointer">
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full border-dashed border-zinc-300 text-zinc-600 hover:text-zinc-900"
            onClick={onAddScrap}
          >
            <Plus className="w-4 h-4 mr-1" />
            Adicionar retalho
          </Button>
        </div>
      )}
    </div>
  )
}
