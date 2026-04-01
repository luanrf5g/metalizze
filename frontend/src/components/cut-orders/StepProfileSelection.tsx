'use client'

import { Profile } from "@/types/profile"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ProfileSelector } from "@/components/ProfileSelector"
import { AlertTriangle } from "lucide-react"
import { translateProfileType, formatProfileDimensions } from "@/lib/formatters"

interface StepProfileSelectionProps {
  profiles: Profile[]
  profileId: string
  selectedProfile: Profile | null
  quantity: string
  description: string
  onSelectProfile: (id: string) => void
  onQuantityChange: (value: string) => void
  onDescriptionChange: (value: string) => void
}

export function StepProfileSelection({
  profiles,
  profileId,
  selectedProfile,
  quantity,
  description,
  onSelectProfile,
  onQuantityChange,
  onDescriptionChange,
}: StepProfileSelectionProps) {
  return (
    <div className="w-full flex-shrink-0 p-6 space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">Selecionar Perfil</h2>
        <p className="text-sm text-zinc-500 mt-0.5">
          Escolha o perfil que será utilizado no corte.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Perfil (SKU)</Label>
          <ProfileSelector
            profiles={profiles}
            selectedProfileId={profileId}
            selectedProfile={selectedProfile}
            onSelectProfile={onSelectProfile}
          />
          {selectedProfile && (
            <>
              <div className="mt-2 text-xs text-zinc-500 space-y-0.5">
                <p>Disponíveis: {selectedProfile.quantity}</p>
                <p>Tipo: {translateProfileType(selectedProfile.profileType)}</p>
                <p>Dimensões: {formatProfileDimensions(selectedProfile)}</p>
              </div>
              {selectedProfile.quantity === 0 && (
                <div className="mt-2 flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                  <AlertTriangle className="h-4 w-4 mt-0.5 text-amber-500" />
                  <p>
                    Este perfil está com <span className="font-semibold">0 unidades em estoque</span>.
                    Verifique se deseja realmente utilizá-lo para esta ordem de corte.
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
