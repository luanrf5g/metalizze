"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Material } from "@/types/material"
import { Client } from "@/types/clients"
import { useAuth } from "@/components/AuthProvider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Plus, Trash2, CheckCircle2, XCircle, Loader2 } from "lucide-react"

interface BulkSheetRow {
  id: string
  materialId: string
  clientId: string // "none" = estoque próprio
  width: string
  height: string
  thickness: string
  quantity: string
  unitPrice: string
  status: "idle" | "processing" | "success" | "error"
  errorMessage?: string
  collapsed: boolean
}

const MOVEMENT_DESCRIPTION = "População de estoque"

function createEmptyRow(): BulkSheetRow {
  return {
    id: crypto.randomUUID(),
    materialId: "",
    clientId: "none",
    width: "",
    height: "",
    thickness: "",
    quantity: "",
    unitPrice: "",
    status: "idle",
    collapsed: false,
  }
}

export default function BulkInsertSheetsPage() {
  const { user } = useAuth()
  const canCreate = user?.role === "ADMIN" || user?.permissions?.["sheets"]?.write

  const [materials, setMaterials] = useState<Material[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [rows, setRows] = useState<BulkSheetRow[]>([createEmptyRow()])
  const [isLoadingOptions, setIsLoadingOptions] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [processedCount, setProcessedCount] = useState(0)

  function buildRowSummary(row: BulkSheetRow) {
    const material = materials.find(m => m.id === row.materialId)
    const client = row.clientId === "none" ? null : clients.find(c => c.id === row.clientId)

    const materialLabel = material?.name ?? "Material não definido"
    const clientLabel = client ? client.name : "Estoque Próprio"

    const heightLabel = row.height || "?"
    const widthLabel = row.width || "?"
    const thicknessLabel = row.thickness || "?"
    const qtyLabel = row.quantity ? `${row.quantity} un` : "Qtd ?"

    const priceNumber = row.unitPrice ? Number(row.unitPrice) : null
    const priceLabel = priceNumber && priceNumber > 0
      ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(priceNumber)
      : null

    const parts = [
      materialLabel,
      clientLabel,
      `${heightLabel}x${widthLabel}x${thicknessLabel}mm`,
      qtyLabel,
    ]

    if (priceLabel) parts.push(priceLabel)

    return parts.join(" • ")
  }

  useEffect(() => {
    async function loadOptions() {
      try {
        const [materialsRes, clientsRes] = await Promise.all([
          api.get("/materials"),
          api.get("/clients"),
        ])

        setMaterials(materialsRes.data.materials ?? [])
        setClients(clientsRes.data.clients ?? [])
      } catch (error) {
        console.error("Erro ao carregar materiais/clientes", error)
        toast.error("Não foi possível carregar materiais e clientes.")
      } finally {
        setIsLoadingOptions(false)
      }
    }

    loadOptions()
  }, [])

  function updateRow(id: string, patch: Partial<BulkSheetRow>) {
    setRows(prev => prev.map(row => row.id === id ? { ...row, ...patch } : row))
  }

  function addRow() {
    setRows(prev => [...prev, createEmptyRow()])
  }

  function removeRow(id: string) {
    setRows(prev => prev.length === 1 ? prev : prev.filter(row => row.id !== id))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!canCreate) {
      toast.error("Você não tem permissão para cadastrar chapas.")
      return
    }

    const validRows = rows.filter(row => {
      return (
        row.materialId &&
        row.width && Number(row.width) > 0 &&
        row.height && Number(row.height) > 0 &&
        row.thickness && Number(row.thickness) > 0 &&
        row.quantity && Number(row.quantity) > 0
      )
    })

    if (validRows.length === 0) {
      toast.error("Adicione pelo menos uma chapa com dados válidos.")
      return
    }

    setIsSubmitting(true)
    setProcessedCount(0)

    // reset status
    setRows(prev => prev.map(row => ({ ...row, status: "idle", errorMessage: undefined })))

    let successCount = 0
    let errorCount = 0

    for (const current of validRows) {
      setRows(prev => prev.map(row => row.id === current.id ? { ...row, status: "processing", errorMessage: undefined } : row))

      try {
        const price = current.unitPrice ? Number(current.unitPrice) : null

        await api.post("/sheets", {
          materialId: current.materialId,
          clientId: current.clientId === "none" ? null : current.clientId,
          width: Number(current.width),
          height: Number(current.height),
          thickness: Number(current.thickness),
          quantity: Number(current.quantity),
          price: price && price > 0 ? price : null,
          description: MOVEMENT_DESCRIPTION,
        })

        successCount += 1
        setRows(prev => prev.map(row => row.id === current.id ? { ...row, status: "success" } : row))
      } catch (error) {
        console.error("Erro ao cadastrar chapa em lote", error)
        errorCount += 1
        setRows(prev => prev.map(row => row.id === current.id ? { ...row, status: "error", errorMessage: "Erro ao cadastrar" } : row))
      } finally {
        setProcessedCount(prev => prev + 1)
      }
    }

    if (successCount > 0 && errorCount === 0) {
      toast.success(`${successCount} chapa(s) cadastrada(s) com sucesso!`)
      // limpa linhas bem sucedidas e deixa uma nova linha vazia
      setRows([createEmptyRow()])
    } else if (successCount > 0 && errorCount > 0) {
      toast.warning(`${successCount} chapa(s) cadastrada(s), ${errorCount} falhou(am). Confira a lista abaixo.`)
    } else {
      toast.error("Nenhuma chapa foi cadastrada. Verifique os dados e tente novamente.")
    }

    setIsSubmitting(false)
  }

  if (!canCreate) {
    return (
      <div className="p-6 md:p-10 w-full h-full mx-auto flex flex-col items-center justify-center text-center space-y-4">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Acesso restrito</h1>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-md">
          Você não tem permissão para acessar a página de população de estoque em lote.
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-10 w-full h-full mx-auto flex flex-col space-y-6 animate-in fade-in zoom-in-95 duration-700">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400 pb-1">
            População de Estoque (Lote)
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mt-1 max-w-xl">
            Página interna para inserção rápida de várias chapas de uma só vez, mantendo o histórico organizado.
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">
            Todos os movimentos gerados terão a descrição padrão: <span className="font-semibold text-zinc-800 dark:text-zinc-200">"{MOVEMENT_DESCRIPTION}"</span>.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 backdrop-blur-md">
            Página oculta · acesso via URL /stock/bulk-insert
          </span>
          {isSubmitting && (
            <span>
              Processando chapas: {processedCount}/{rows.length}
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass-card flex-1 flex flex-col p-4 md:p-6 space-y-4 min-h-0">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex flex-col gap-1 text-sm text-zinc-500 dark:text-zinc-400">
            <span>Preencha as linhas abaixo com os dados principais de cada chapa.</span>
            <span>Campos obrigatórios: Material, Altura, Largura, Espessura e Quantidade.</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRows([createEmptyRow()])}
              disabled={isSubmitting}
            >
              Limpar tudo
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={addRow}
              disabled={isSubmitting}
              className="hover:cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar linha
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto hide-v-scroll rounded-2xl border border-white/40 dark:border-white/10 bg-white/30 dark:bg-black/30 backdrop-blur-2xl p-3 space-y-3">
          {isLoadingOptions ? (
            <div className="flex items-center justify-center h-40 text-zinc-500 text-sm">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Carregando materiais e clientes...
            </div>
          ) : (
            rows.map((row, index) => (
              <div
                key={row.id}
                className="glass-panel rounded-2xl px-3 py-3 md:px-4 md:py-4 flex flex-col gap-3 border border-white/40 dark:border-white/10"
              >
                {row.collapsed ? (
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 text-xs md:text-sm text-zinc-700 dark:text-zinc-200">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                        Chapa #{(index + 1).toString().padStart(2, "0")}
                      </span>
                      <span className="hidden md:inline text-zinc-400">•</span>
                      <span className="truncate md:max-w-xl" title={buildRowSummary(row)}>
                        {buildRowSummary(row)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {row.status === "processing" && (
                        <span className="flex items-center text-xs text-zinc-500">
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Processando
                        </span>
                      )}
                      {row.status === "success" && (
                        <span className="flex items-center text-xs text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Ok
                        </span>
                      )}
                      {row.status === "error" && (
                        <span className="flex items-center text-xs text-red-500">
                          <XCircle className="w-3 h-3 mr-1" /> Erro
                        </span>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => updateRow(row.id, { collapsed: false })}
                        disabled={isSubmitting}
                        className="text-xs"
                      >
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRow(row.id)}
                        disabled={rows.length === 1 || isSubmitting}
                        className="rounded-full text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        Chapa #{(index + 1).toString().padStart(2, "0")}
                      </div>
                      <div className="flex items-center gap-2">
                        {row.status === "processing" && (
                          <span className="flex items-center text-xs text-zinc-500">
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Processando
                          </span>
                        )}
                        {row.status === "success" && (
                          <span className="flex items-center text-xs text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Ok
                          </span>
                        )}
                        {row.status === "error" && (
                          <span className="flex items-center text-xs text-red-500">
                            <XCircle className="w-3 h-3 mr-1" /> Erro
                          </span>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateRow(row.id, { collapsed: true })}
                          disabled={isSubmitting}
                          className="text-xs"
                        >
                          Concluir
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeRow(row.id)}
                          disabled={rows.length === 1 || isSubmitting}
                          className="rounded-full text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Material</Label>
                        <Select
                          value={row.materialId}
                          onValueChange={(value) => updateRow(row.id, { materialId: value })}
                        >
                          <SelectTrigger className="w-full bg-white/70 dark:bg-black/40">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-zinc-900">
                            {materials.map(material => (
                              <SelectItem key={material.id} value={material.id} className="hover:cursor-pointer">
                                {material.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Cliente</Label>
                        <Select
                          value={row.clientId}
                          onValueChange={(value) => updateRow(row.id, { clientId: value })}
                        >
                          <SelectTrigger className="w-full bg-white/70 dark:bg-black/40">
                            <SelectValue placeholder="Estoque Próprio" />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-zinc-900">
                            <SelectGroup>
                              <SelectLabel>Cliente</SelectLabel>
                              <SelectItem value="none">Estoque Próprio</SelectItem>
                              {clients.map(client => (
                                <SelectItem key={client.id} value={client.id} className="hover:cursor-pointer">
                                  {client.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Altura (mm)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={row.height}
                          onChange={e => updateRow(row.id, { height: e.target.value })}
                          placeholder="Ex: 3000"
                          className="glass-input"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Largura (mm)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={row.width}
                          onChange={e => updateRow(row.id, { width: e.target.value })}
                          placeholder="Ex: 1200"
                          className="glass-input"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Espessura (mm)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={row.thickness}
                          onChange={e => updateRow(row.id, { thickness: e.target.value })}
                          placeholder="Ex: 4.75"
                          className="glass-input"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Quantidade</Label>
                        <Input
                          type="number"
                          min="1"
                          value={row.quantity}
                          onChange={e => updateRow(row.id, { quantity: e.target.value })}
                          placeholder="Qtd. de chapas"
                          className="glass-input"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Preço Unitário (R$) (opcional)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={row.unitPrice}
                          onChange={e => updateRow(row.id, { unitPrice: e.target.value })}
                          placeholder="Ex: 250.00"
                          className="glass-input"
                        />
                      </div>
                    </div>

                    {row.errorMessage && (
                      <p className="text-xs text-red-500 mt-1">{row.errorMessage}</p>
                    )}
                  </>
                )}
              </div>
            ))
          )}
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-2">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
            <p>
              Linhas totais: <span className="font-semibold text-zinc-800 dark:text-zinc-100">{rows.length}</span>
            </p>
            <p>
              Quantidade total planejada: {" "}
              <span className="font-semibold text-zinc-800 dark:text-zinc-100">
                {rows.reduce((acc, row) => acc + (Number(row.quantity) || 0), 0)} un
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <Button
              type="submit"
              className="hover:cursor-pointer"
              disabled={isSubmitting || isLoadingOptions}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Inserindo chapas...
                </>
              ) : (
                "Inserir chapas em lote"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
