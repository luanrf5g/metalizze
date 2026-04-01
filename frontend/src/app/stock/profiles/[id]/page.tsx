'use client'

import { useEffect, useState, use } from 'react'
import { api } from '@/lib/api'
import { Material } from '@/types/material'
import { Client } from '@/types/clients'
import { ProfileType } from '@/types/profile'
import { translateProfileType, formatDate, formatCurrency } from '@/lib/formatters'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { ArrowLeft, Pencil, Save, X, Package, Ruler, DollarSign, MapPin } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'

const PROFILE_TYPES: { value: ProfileType; label: string; equalDimensions: boolean }[] = [
  { value: 'SQUARE', label: 'Quadrado', equalDimensions: true },
  { value: 'RECTANGULAR', label: 'Retangular', equalDimensions: false },
  { value: 'ROUND', label: 'Redondo', equalDimensions: true },
  { value: 'OBLONG', label: 'Oblongo', equalDimensions: false },
  { value: 'ANGLE', label: 'Cantoneira', equalDimensions: true },
  { value: 'U_CHANNEL', label: 'Perfil U', equalDimensions: false },
]

interface ProfileDetails {
  id: string
  sku: string
  profileType: ProfileType
  materialId: string
  clientId: string | null
  width: number
  height: number
  length: number
  thickness: number
  quantity: number
  price: number | null
  storageLocation: string | null
  createdAt: string
}

export default function ProfileDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [profile, setProfile] = useState<ProfileDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [materials, setMaterials] = useState<Material[]>([])
  const [clients, setClients] = useState<Client[]>([])

  const [editMaterialId, setEditMaterialId] = useState('')
  const [editClientId, setEditClientId] = useState('none')
  const [editProfileType, setEditProfileType] = useState<ProfileType>('SQUARE')
  const [editWidth, setEditWidth] = useState('')
  const [editHeight, setEditHeight] = useState('')
  const [editLength, setEditLength] = useState('')
  const [editThickness, setEditThickness] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editStorageLocation, setEditStorageLocation] = useState('')

  const { user } = useAuth()
  const canEdit = user?.role === 'ADMIN' || user?.permissions?.['sheets']?.write

  const selectedType = PROFILE_TYPES.find(t => t.value === editProfileType)
  const isEqualDimensions = selectedType?.equalDimensions ?? false

  useEffect(() => {
    if (isEqualDimensions && editWidth) {
      setEditHeight(editWidth)
    }
  }, [editWidth, isEqualDimensions])

  async function fetchProfile() {
    setIsLoading(true)
    try {
      const response = await api.get(`/profiles/${id}`)
      const data = response.data.profile as ProfileDetails
      setProfile(data)
    } catch (error) {
      console.error('Erro ao buscar perfil:', error)
      toast.error('Erro ao carregar os detalhes do perfil.')
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
    if (!profile) return
    setEditMaterialId(profile.materialId)
    setEditClientId(profile.clientId ?? 'none')
    setEditProfileType(profile.profileType)
    setEditWidth(String(profile.width))
    setEditHeight(String(profile.height))
    setEditLength(String(profile.length))
    setEditThickness(String(profile.thickness))
    setEditPrice(String(profile.price ?? 0))
    setEditStorageLocation(profile.storageLocation ?? '')
    setIsEditing(true)
  }

  function cancelEditing() {
    setIsEditing(false)
  }

  async function handleSave() {
    if (!profile) return
    setIsSaving(true)
    try {
      const payload: Record<string, unknown> = {}

      if (editMaterialId !== profile.materialId) payload.materialId = editMaterialId
      if ((editClientId === 'none' ? null : editClientId) !== profile.clientId) {
        payload.clientId = editClientId === 'none' ? null : editClientId
      }
      if (editProfileType !== profile.profileType) payload.profileType = editProfileType
      if (Number(editWidth) !== profile.width) payload.width = Number(editWidth)
      if (Number(editHeight) !== profile.height) payload.height = Number(editHeight)
      if (Number(editLength) !== profile.length) payload.length = Number(editLength)
      if (Number(editThickness) !== profile.thickness) payload.thickness = Number(editThickness)
      if (Number(editPrice) !== (profile.price ?? 0)) payload.price = Number(editPrice)

      const newStorageLocation = editStorageLocation.trim() || null
      if (newStorageLocation !== (profile.storageLocation ?? null)) {
        payload.storageLocation = newStorageLocation
      }

      if (Object.keys(payload).length === 0) {
        toast.info('Nenhuma alteração detectada.')
        setIsEditing(false)
        setIsSaving(false)
        return
      }

      await api.put(`/profiles/${id}`, payload)

      toast.success('Perfil atualizado com sucesso!')
      setIsEditing(false)
      await fetchProfile()
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      toast.error('Erro ao salvar alterações.')
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    fetchProfile()
    fetchMaterials()
    fetchClients()
  }, [])

  const materialName = materials.find(m => m.id === profile?.materialId)?.name ?? '—'
  const clientName = clients.find(c => c.id === profile?.clientId)?.name ?? null

  if (isLoading) {
    return (
      <div className="p-6 md:p-10 w-full h-full mx-auto flex items-center justify-center animate-in fade-in duration-500">
        <p className="text-zinc-500">Carregando detalhes do perfil...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="p-6 md:p-10 w-full h-full mx-auto flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
        <p className="text-zinc-500">Perfil não encontrado.</p>
        <Button asChild variant="outline">
          <Link href="/stock?tab=profiles"><ArrowLeft className="mr-2 h-4 w-4" />Voltar ao Estoque</Link>
        </Button>
      </div>
    )
  }

  const profileTypeInfo = PROFILE_TYPES.find(t => t.value === profile.profileType)

  return (
    <div className="p-6 md:p-10 w-full h-full mx-auto flex flex-col space-y-6 animate-in fade-in zoom-in-95 duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon" className="shrink-0">
            <Link href="/stock?tab=profiles"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                {profile.sku}
              </h1>
              <Badge className='bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/40 dark:text-violet-300 dark:border-violet-800'>
                {translateProfileType(profile.profileType)}
              </Badge>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">
              Cadastrado em {formatDate(profile.createdAt, true)}
            </p>
          </div>
        </div>
        {canEdit && !isEditing && (
          <Button onClick={startEditing} className="hover:cursor-pointer">
            <Pencil className="mr-2 h-4 w-4" />Editar Perfil
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
          {/* Profile Type & Dimensions */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Ruler className="h-5 w-5 text-zinc-500" />
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Dimensões</h2>
            </div>
            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipo de Perfil</Label>
                  <Select value={editProfileType} onValueChange={(v) => setEditProfileType(v as ProfileType)}>
                    <SelectTrigger className="w-full max-w-xs bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {PROFILE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>{isEqualDimensions ? 'Largura / Diâmetro (mm)' : 'Largura (mm)'}</Label>
                    <Input type="number" value={editWidth} onChange={(e) => setEditWidth(e.target.value)} />
                  </div>
                  {!isEqualDimensions && (
                    <div className="space-y-2">
                      <Label>Altura (mm)</Label>
                      <Input type="number" value={editHeight} onChange={(e) => setEditHeight(e.target.value)} />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Comprimento (mm)</Label>
                    <Input type="number" value={editLength} onChange={(e) => setEditLength(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Espessura (mm)</Label>
                    <Input type="number" step="0.01" value={editThickness} onChange={(e) => setEditThickness(e.target.value)} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-4 text-center">
                  <p className="text-xs text-zinc-500 mb-1">{profileTypeInfo?.equalDimensions ? 'Largura / Diâmetro' : 'Largura'}</p>
                  <p className="text-xl font-bold text-zinc-900 dark:text-white">{profile.width}<span className="text-sm font-normal text-zinc-400 ml-1">mm</span></p>
                </div>
                {!profileTypeInfo?.equalDimensions && (
                  <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-4 text-center">
                    <p className="text-xs text-zinc-500 mb-1">Altura</p>
                    <p className="text-xl font-bold text-zinc-900 dark:text-white">{profile.height}<span className="text-sm font-normal text-zinc-400 ml-1">mm</span></p>
                  </div>
                )}
                <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-4 text-center">
                  <p className="text-xs text-zinc-500 mb-1">Comprimento</p>
                  <p className="text-xl font-bold text-zinc-900 dark:text-white">{profile.length}<span className="text-sm font-normal text-zinc-400 ml-1">mm</span></p>
                </div>
                <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-4 text-center">
                  <p className="text-xs text-zinc-500 mb-1">Espessura</p>
                  <p className="text-xl font-bold text-zinc-900 dark:text-white">{profile.thickness}<span className="text-sm font-normal text-zinc-400 ml-1">mm</span></p>
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

          <Separator />

          {/* Storage Location */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-zinc-500" />
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Local de Armazenamento</h2>
            </div>
            {isEditing ? (
              <Textarea
                placeholder="Ex: Prateleira 3, ao lado dos tubos redondos..."
                value={editStorageLocation}
                onChange={(e) => setEditStorageLocation(e.target.value)}
                rows={3}
                className="resize-none w-full"
              />
            ) : (
              <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-4">
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                  {profile.storageLocation ? profile.storageLocation : <span className="text-zinc-400 italic">Não informado</span>}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar stats */}
        <div className="space-y-4">
          {/* Quantity card */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <Package className="h-5 w-5 text-violet-500" />
              <h3 className="text-sm font-semibold text-zinc-500">Estoque</h3>
            </div>
            <p className="text-4xl font-extrabold text-zinc-900 dark:text-white">
              {profile.quantity}
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
                  {formatCurrency(profile.price)}
                </p>
                {profile.quantity > 0 && profile.price && profile.price > 0 && (
                  <p className="text-xs text-zinc-500 mt-2">
                    Valor total em estoque: <strong>{formatCurrency(profile.price * profile.quantity)}</strong>
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
              <span className="font-mono text-zinc-900 dark:text-white text-xs truncate max-w-[180px]" title={profile.sku}>{profile.sku}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Tipo</span>
              <span className="text-zinc-900 dark:text-white">{translateProfileType(profile.profileType)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Cadastro</span>
              <span className="text-zinc-900 dark:text-white">{formatDate(profile.createdAt, true)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">ID</span>
              <span className="font-mono text-xs text-zinc-400 truncate max-w-[180px]" title={profile.id}>{profile.id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
