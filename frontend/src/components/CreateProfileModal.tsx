'use client'

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"
import { Material } from "@/types/material"
import { api } from "@/lib/api"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select"
import { Input } from "./ui/input"
import { Client } from "@/types/clients"
import { toast } from "sonner"
import { Switch } from "./ui/switch"
import { Textarea } from "./ui/textarea"
import { ProfileType } from "@/types/profile"

interface CreateProfileModalProps {
  onSuccess: () => void
}

const PROFILE_TYPES: { value: ProfileType; label: string; equalDimensions: boolean }[] = [
  { value: 'SQUARE', label: 'Quadrado', equalDimensions: true },
  { value: 'RECTANGULAR', label: 'Retangular', equalDimensions: false },
  { value: 'ROUND', label: 'Redondo', equalDimensions: true },
  { value: 'OBLONG', label: 'Oblongo', equalDimensions: false },
  { value: 'ANGLE', label: 'Cantoneira', equalDimensions: true },
  { value: 'U_CHANNEL', label: 'Perfil U', equalDimensions: false },
]

export function CreateProfileModal({ onSuccess }: CreateProfileModalProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [materials, setMaterials] = useState<Material[]>([])
  const [clients, setClients] = useState<Client[]>([])

  const [materialId, setMaterialId] = useState("")
  const [clientId, setClientId] = useState("none")
  const [profileType, setProfileType] = useState<ProfileType>("SQUARE")
  const [width, setWidth] = useState("")
  const [height, setHeight] = useState("")
  const [length, setLength] = useState("")
  const [thickness, setThickness] = useState("")
  const [quantity, setQuantity] = useState("")
  const [description, setDescription] = useState("")

  const [autoCalcPrice, setAutoCalcPrice] = useState(false)
  const [unitPrice, setUnitPrice] = useState("")
  const [totalPrice, setTotalPrice] = useState("")

  const selectedType = PROFILE_TYPES.find(t => t.value === profileType)
  const isEqualDimensions = selectedType?.equalDimensions ?? false

  useEffect(() => {
    if (isEqualDimensions && width) {
      setHeight(width)
    }
  }, [width, isEqualDimensions])

  async function handleCreateProfile(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    try {
      const finalPrice = autoCalcPrice
        ? (totalPrice && quantity ? Number(totalPrice) / Number(quantity) : 0)
        : (unitPrice ? Number(unitPrice) : 0)

      await api.post('/profiles', {
        materialId,
        clientId: clientId === 'none' ? null : clientId,
        profileType,
        width: Number(width),
        height: isEqualDimensions ? Number(width) : Number(height),
        length: Number(length),
        thickness: Number(thickness),
        quantity: Number(quantity),
        price: finalPrice > 0 ? finalPrice : null,
        description: description.trim() || undefined,
      })

      setMaterialId("")
      setClientId("none")
      setProfileType("SQUARE")
      setWidth("")
      setHeight("")
      setLength("")
      setThickness("")
      setQuantity("")
      setUnitPrice("")
      setTotalPrice("")
      setDescription("")
      setAutoCalcPrice(false)
      setOpen(false)
      onSuccess()
      toast.success("Perfil cadastrado com sucesso!", { duration: 2000 })
    } catch (error) {
      console.error('Erro ao cadastrar perfil:', error)
      toast.error("Erro ao tentar cadastrar o perfil. Verifique os dados.", { duration: 2000 })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    async function load() {
      try {
        const [materialsRes, clientsRes] = await Promise.all([
          api.get('/materials'),
          api.get('/clients'),
        ])
        setMaterials(materialsRes.data.materials)
        setClients(clientsRes.data.clients)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      }
    }
    load()
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="hover:cursor-pointer">Adicionar Perfil</Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] flex flex-col">
        <DialogTitle>Adicionar Perfil</DialogTitle>
        <DialogDescription>
          Cadastre um novo perfil para ser adicionado ao estoque.
        </DialogDescription>

        <form onSubmit={handleCreateProfile} className="space-y-4 mt-4 overflow-y-auto pr-1 flex-1">
          {/* Material */}
          <div className="space-y-2">
            <Label htmlFor="material">Material</Label>
            <Select value={materialId} onValueChange={setMaterialId}>
              <SelectTrigger className="w-full max-w-64 bg-white">
                <SelectValue placeholder="Selecione um Material" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {materials.map((material) => (
                  <SelectItem key={material.id} value={material.id} className="hover:cursor-pointer">
                    {material.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Profile Type */}
          <div className="space-y-2">
            <Label htmlFor="profileType">Tipo de Perfil</Label>
            <Select value={profileType} onValueChange={(v) => setProfileType(v as ProfileType)}>
              <SelectTrigger className="w-full max-w-64 bg-white">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {PROFILE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="hover:cursor-pointer">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dimensions */}
          <div className="flex items-center gap-3">
            <div className="space-y-2 flex-1">
              <Label htmlFor="width">{isEqualDimensions ? 'Largura / Diâmetro (mm)' : 'Largura (mm)'}</Label>
              <Input
                id="width"
                type="number"
                placeholder="Ex: 50"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                required
              />
            </div>

            {!isEqualDimensions && (
              <div className="space-y-2 flex-1">
                <Label htmlFor="height">Altura (mm)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="Ex: 100"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  required
                />
              </div>
            )}
          </div>

          {/* Length, Thickness, Quantity */}
          <div className="flex items-center gap-3">
            <div className="space-y-2 flex-1">
              <Label htmlFor="length">Comprimento (mm)</Label>
              <Input
                id="length"
                type="number"
                placeholder="Ex: 6000"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2 flex-1">
              <Label htmlFor="thickness">Espessura (mm)</Label>
              <Input
                id="thickness"
                type="number"
                step="0.01"
                placeholder="Ex: 2.00"
                value={thickness}
                onChange={(e) => setThickness(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantidade</Label>
            <Input
              id="quantity"
              type="number"
              placeholder="Quantidade de perfis"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          {/* Client */}
          <div className="space-y-2">
            <Label htmlFor="clientId">Cliente</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger className="w-full max-w-64 bg-white">
                <SelectValue placeholder="Selecione um Cliente" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectGroup>
                  <SelectLabel>Cliente</SelectLabel>
                  <SelectItem value="none">Estoque Próprio</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id} className="hover:cursor-pointer">
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Price */}
          <div className="space-y-3 rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Valor de Compra</Label>
              <div className="flex items-center gap-2">
                <Label htmlFor="auto-calc-profile" className="text-xs text-zinc-500">
                  Calcular pelo total da nota
                </Label>
                <Switch
                  id="auto-calc-profile"
                  checked={autoCalcPrice}
                  onCheckedChange={setAutoCalcPrice}
                />
              </div>
            </div>

            {autoCalcPrice ? (
              <div className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="totalPriceProfile" className="text-xs text-zinc-500">Valor Total da Nota (R$)</Label>
                  <Input
                    id="totalPriceProfile"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Ex: 5000.00"
                    value={totalPrice}
                    onChange={(e) => setTotalPrice(e.target.value)}
                  />
                </div>
                {totalPrice && quantity && Number(quantity) > 0 && (
                  <p className="text-xs text-zinc-500">
                    Valor unitário calculado: <strong className="text-zinc-900">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(totalPrice) / Number(quantity))}
                    </strong>
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                <Label htmlFor="unitPriceProfile" className="text-xs text-zinc-500">Valor Unitário (R$)</Label>
                <Input
                  id="unitPriceProfile"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ex: 250.00"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="descriptionProfile">Descrição (opcional)</Label>
            <Textarea
              id="descriptionProfile"
              placeholder="Descrição para o movimento de estoque..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant='outline' onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type='submit' className="hover:cursor-pointer" disabled={isLoading}>
              {isLoading ? 'Cadastrando...' : 'Cadastrar Perfil'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
