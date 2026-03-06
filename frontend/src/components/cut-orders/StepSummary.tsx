'use client'

import { Sheet } from "@/types/sheet"
import { Client } from "@/types/clients"
import { ScrapForm } from "./StepScraps"

interface StepSummaryProps {
  selectedSheet: Sheet | null
  quantity: string
  description: string
  hasScraps: boolean
  scraps: ScrapForm[]
  clients: Client[]
}

export function StepSummary({
  selectedSheet,
  quantity,
  description,
  hasScraps,
  scraps,
  clients,
}: StepSummaryProps) {
  return (
    <div className="w-full flex-shrink-0 p-6 space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">Resumo da Ordem</h2>
        <p className="text-sm text-zinc-500 mt-0.5">
          Confira os dados antes de registrar.
        </p>
      </div>

      <div className="space-y-4">
        {/* Sheet info */}
        <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Chapa</p>
          {selectedSheet ? (
            <div className="space-y-1">
              <p className="text-sm font-medium text-zinc-900">SKU: {selectedSheet.sku}</p>
              {(selectedSheet.width || selectedSheet.height) && (
                <p className="text-xs text-zinc-600">
                  Dimensões: {selectedSheet.width}mm × {selectedSheet.height}mm
                  {selectedSheet.thickness ? ` — Espessura: ${selectedSheet.thickness}mm` : ''}
                </p>
              )}
              <p className="text-xs text-zinc-600">
                Tipo: {selectedSheet.type === "STANDARD" ? "Chapa Original" : "Retalho"}
              </p>
            </div>
          ) : (
            <p className="text-sm text-zinc-400">Nenhuma chapa selecionada</p>
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

        {/* Scraps info */}
        <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Retalhos</p>
          {hasScraps && scraps.length > 0 ? (
            <div className="space-y-2">
              {scraps.map((scrap, i) => {
                const client = clients.find((c) => c.id === scrap.clientId)
                return (
                  <div key={i} className="flex items-center justify-between text-sm text-zinc-700 py-1 border-b border-zinc-100 last:border-0">
                    <span>
                      Retalho {i + 1}: {scrap.width}mm × {scrap.height}mm — Qtd: {scrap.quantity}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {scrap.clientId === "none" ? "Estoque Próprio" : client?.name ?? "—"}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-zinc-400">Nenhum retalho será gerado</p>
          )}
        </div>
      </div>
    </div>
  )
}
