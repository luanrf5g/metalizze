'use client'

import { useEffect, useState, use } from 'react'
import { api } from '@/lib/api'
import { Material } from '@/types/material'
import { Client } from '@/types/clients'
import { translateSheetType, formatDate, formatCurrency } from '@/lib/formatters'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { ArrowLeft, Pencil, Save, X, Package, Ruler, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'

interface SheetDetails {
  id: string
  sku: string
  clientId: string | null
  materialId: string
  thickness: number
  width: number
  height: number
  quantity: number
  price: number
  type: 'STANDARD' | 'SCRAP'
  created: string
}

export default function SheetDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [sheet, setSheet] = useState<SheetDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [materials, setMaterials] = useState<Material[]>([])
  const [clients, setClients] = useState<Client[]>([])

  // Edit form states
  const [editMaterialId, setEditMaterialId] = useState('')
  const [editClientId, setEditClientId] = useState('none')
  const [editWidth, setEditWidth] = useState('')
  const [editHeight, setEditHeight] = useState('')
  const [editThickness, setEditThickness] = useState('')
  const [editType, setEditType] = useState<'STANDARD' | 'SCRAP'>('STANDARD')
  const [editPrice, setEditPrice] = useState('')

  const { user } = useAuth()
  const canEdit = user?.role === 'ADMIN' || user?.permissions?.['sheets']?.write

  async function fetchSheet() {
    setIsLoading(true)
    try {
      const response = await api.get(`/sheets/${id}`)
      const data = response.data.sheet as SheetDetails
      setSheet(data)
    } catch (error) {
      console.error('Erro ao buscar chapa:', error)
      toast.error('Erro ao carregar os detalhes da chapa.')
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchMaterials() {
    try {
      const response = await api.get('/materials')
      setMaterials(response.data.materials)
    } catch (error) {
      console.error('Erro ao buscar materiais:', error)
    }
  }

  async function fetchClients() {
    try {
      const response = await api.get('/clients')
      setClients(response.data.clients)
    } catch (error) {
      console.error('Erro ao buscar clientes:', error)
    }
  }

  function startEditing() {
    if (!sheet) return
    setEditMaterialId(sheet.materialId)
    setEditClientId(sheet.clientId ?? 'none')
    setEditWidth(String(sheet.width))
    setEditHeight(String(sheet.height))
    setEditThickness(String(sheet.thickness))
    setEditType(sheet.type)
    setEditPrice(String(sheet.price ?? 0))
    setIsEditing(true)
  }

  function cancelEditing() {
    setIsEditing(false)
  }

  async function handleSave() {
    if (!sheet) return
    setIsSaving(true)
    try {
      const payload: Record<string, unknown> = {}

      if (editMaterialId !== sheet.materialId) payload.materialId = editMaterialId
      if ((editClientId === 'none' ? null : editClientId) !== sheet.clientId) {
        payload.clientId = editClientId === 'none' ? null : editClientId
      }
      if (Number(editWidth) !== sheet.width) payload.width = Number(editWidth)
      if (Number(editHeight) !== sheet.height) payload.height = Number(editHeight)
      if (Number(editThickness) !== sheet.thickness) payload.thickness = Number(editThickness)
      if (editType !== sheet.type) payload.type = editType
      if (Number(editPrice) !== sheet.price) payload.price = Number(editPrice)

      if (Object.keys(payload).length === 0) {
        toast.info('Nenhuma alteração detectada.')
        setIsEditing(false)
        setIsSaving(false)
        return
      }

      await api.put(`/sheets/${id}`, payload)

      toast.success('Chapa atualizada com sucesso!')
      setIsEditing(false)
      await fetchSheet()
    } catch (error) {
      console.error('Erro ao atualizar chapa:', error)
      toast.error('Erro ao salvar alterações.')
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    fetchSheet()
    fetchMaterials()
    fetchClients()
  }, [])

  const materialName = materials.find(m => m.id === sheet?.materialId)?.name ?? '—'
  const clientName = clients.find(c => c.id === sheet?.clientId)?.name ?? null

  if (isLoading) {
    return (
      <div className="p-6 md:p-10 w-full h-full mx-auto flex items-center justify-center animate-in fade-in duration-500">
        <p className="text-zinc-500">Carregando detalhes da chapa...</p>
      </div>
    )
  }

  if (!sheet) {
    return (
      <div className="p-6 md:p-10 w-full h-full mx-auto flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
        <p className="text-zinc-500">Chapa não encontrada.</p>
        <Button asChild variant="outline">
          <Link href="/sheets"><ArrowLeft className="mr-2 h-4 w-4" />Voltar ao Estoque</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-10 w-full h-full mx-auto flex flex-col space-y-6 animate-in fade-in zoom-in-95 duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon" className="shrink-0">
            <Link href="/sheets"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                {sheet.sku}
              </h1>
              <Badge variant={sheet.type === 'SCRAP' ? 'outline' : 'default'} className={
                sheet.type === 'SCRAP'
                  ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800'
                  : 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800'
              }>
                {translateSheetType(sheet.type)}
              </Badge>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">
              Cadastrada em {formatDate(sheet.created)}
            </p>
          </div>
        </div>
        {canEdit && !isEditing && (
          <Button onClick={startEditing} className="hover:cursor-pointer">
            <Pencil className="mr-2 h-4 w-4" />Editar Chapa
          </Button>
        )}
        {isEditing && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={cancelEditing} disabled={isSaving}>
              <X className="mr-2 h-4 w-4" />Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="hover:cursor-pointer">
              <Save className="mr-2 h-4 w-4" />{isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Main info card */}
        <div className="lg:col-span-2 glass-card p-6 space-y-6 overflow-auto">
          {/* Dimensions Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Ruler className="h-5 w-5 text-zinc-500" />
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Dimensões</h2>
            </div>
            {isEditing ? (
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Altura (mm)</Label>
                  <Input type="number" value={editHeight} onChange={(e) => setEditHeight(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Largura (mm)</Label>
                  <Input type="number" value={editWidth} onChange={(e) => setEditWidth(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Espessura (mm)</Label>
                  <Input type="number" value={editThickness} onChange={(e) => setEditThickness(e.target.value)} />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-4 text-center">
                  <p className="text-xs text-zinc-500 mb-1">Altura</p>
                  <p className="text-xl font-bold text-zinc-900 dark:text-white">{sheet.height}<span className="text-sm font-normal text-zinc-400 ml-1">mm</span></p>
                </div>
                <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-4 text-center">
                  <p className="text-xs text-zinc-500 mb-1">Largura</p>
                  <p className="text-xl font-bold text-zinc-900 dark:text-white">{sheet.width}<span className="text-sm font-normal text-zinc-400 ml-1">mm</span></p>
                </div>
                <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-4 text-center">
                  <p className="text-xs text-zinc-500 mb-1">Espessura</p>
                  <p className="text-xl font-bold text-zinc-900 dark:text-white">{sheet.thickness}<span className="text-sm font-normal text-zinc-400 ml-1">mm</span></p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Material & Client */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Package className="h-5 w-5 text-zinc-500" />
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Material e Cliente</h2>
            </div>
            {isEditing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Material</Label>
                  <Select value={editMaterialId} onValueChange={setEditMaterialId}>
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder="Selecione um Material" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {materials.map((material) => (
                        <SelectItem key={material.id} value={material.id}>{material.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Cliente</Label>
                  <Select value={editClientId} onValueChange={setEditClientId}>
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue placeholder="Selecione um Cliente" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectGroup>
                        <SelectLabel>Cliente</SelectLabel>
                        <SelectItem value="none">Estoque Próprio</SelectItem>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={editType} onValueChange={(v) => setEditType(v as 'STANDARD' | 'SCRAP')}>
                    <SelectTrigger className="w-full bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="STANDARD">Chapa Original</SelectItem>
                      <SelectItem value="SCRAP">Retalho</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Material</p>
                  <p className="font-medium text-zinc-900 dark:text-white">{materialName}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Cliente</p>
                  <p className="font-medium text-zinc-900 dark:text-white">{clientName ?? <span className="text-zinc-400 italic">Estoque Próprio</span>}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar stats */}
        <div className="space-y-4">
          {/* Quantity card */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <Package className="h-5 w-5 text-blue-500" />
              <h3 className="text-sm font-semibold text-zinc-500">Estoque</h3>
            </div>
            <p className="text-4xl font-extrabold text-zinc-900 dark:text-white">
              {sheet.quantity}
              <span className="text-lg font-normal text-zinc-400 ml-2">un</span>
            </p>
          </div>

          {/* Price card */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="h-5 w-5 text-emerald-500" />
              <h3 className="text-sm font-semibold text-zinc-500">Valor Unitário</h3>
            </div>
            {isEditing ? (
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-zinc-900 dark:text-white">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="text-3xl font-extrabold text-zinc-900 dark:text-white bg-transparent border-b-2 border-emerald-400 focus:border-emerald-500 outline-none w-full appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                />
              </div>
            ) : (
              <>
                <p className="text-3xl font-extrabold text-zinc-900 dark:text-white">
                  {formatCurrency(sheet.price)}
                </p>
                {sheet.quantity > 0 && sheet.price > 0 && (
                  <p className="text-xs text-zinc-500 mt-2">
                    Valor total em estoque: <strong>{formatCurrency(sheet.price * sheet.quantity)}</strong>
                  </p>
                )}
              </>
            )}
          </div>

          {/* Info card */}
          <div className="glass-card p-6 space-y-3">
            <h3 className="text-sm font-semibold text-zinc-500 mb-3">Informações</h3>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">SKU</span>
              <span className="font-mono text-zinc-900 dark:text-white text-xs truncate max-w-[180px]" title={sheet.sku}>{sheet.sku}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Tipo</span>
              <span className="text-zinc-900 dark:text-white">{translateSheetType(sheet.type)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Cadastro</span>
              <span className="text-zinc-900 dark:text-white">{formatDate(sheet.created, true)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">ID</span>
              <span className="font-mono text-xs text-zinc-400 truncate max-w-[180px]" title={sheet.id}>{sheet.id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
