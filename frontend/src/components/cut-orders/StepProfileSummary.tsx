'use client'

import { Profile } from "@/types/profile"
import { translateProfileType, formatProfileDimensions } from "@/lib/formatters"
import { LeftoverForm } from "./StepProfileLeftover"

interface StepProfileSummaryProps {
  selectedProfile: Profile | null
  quantity: string
  description: string
  hasLeftover: boolean
  leftovers: LeftoverForm[]
}

export function StepProfileSummary({
  selectedProfile,
  quantity,
  description,
  hasLeftover,
  leftovers,
}: StepProfileSummaryProps) {
  const validLeftovers = hasLeftover
    ? leftovers.filter((l) => Number(l.length) > 0 && Number(l.quantity) > 0)
    : []

  return (
    <div className="w-full flex-shrink-0 p-6 space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">Resumo da Ordem</h2>
        <p className="text-sm text-zinc-500 mt-0.5">
          Confira os dados antes de registrar.
        </p>
      </div>

      <div className="space-y-4">
        {/* Profile info */}
        <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Perfil</p>
          {selectedProfile ? (
            <div className="space-y-1">
              <p className="text-sm font-medium text-zinc-900">SKU: {selectedProfile.sku}</p>
              <p className="text-xs text-zinc-600">
                Tipo: {translateProfileType(selectedProfile.profileType)}
              </p>
              <p className="text-xs text-zinc-600">
                Dimensões: {formatProfileDimensions(selectedProfile)}
              </p>
              {selectedProfile.material && (
                <p className="text-xs text-zinc-600">
                  Material: {selectedProfile.material.name}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-zinc-400">Nenhum perfil selecionado</p>
          )}
        </div>

        {/* Cut info */}
        <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Corte</p>
          <p className="text-sm text-zinc-900">
            <span className="font-medium">Quantidade:</span> {quantity || "—"}
          </p>
          <p className="text-sm text-zinc-900">
            <span className="font-medium">Descrição:</span> {description || "—"}
          </p>
        </div>

        {/* Leftover info */}
        <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Sobras</p>
          {validLeftovers.length > 0 ? (
            <div className="space-y-1">
              {validLeftovers.map((l, i) => (
                <p key={i} className="text-sm text-zinc-900">
                  {l.quantity}× <span className="font-medium">{l.length}mm</span>
                </p>
              ))}
              <p className="text-xs text-zinc-500 mt-2">
                {validLeftovers.length === 1 ? "Um novo perfil será criado" : `${validLeftovers.length} novos perfis serão criados`} com as mesmas características, porém com comprimentos diferentes.
              </p>
            </div>
          ) : (
            <p className="text-sm text-zinc-400">Nenhuma sobra será registrada</p>
          )}
        </div>
      </div>
    </div>
  )
}
