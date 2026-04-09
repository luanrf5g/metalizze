'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type AdditionalServiceType = 'BENDING' | 'THREADING' | 'WELDING'

const SERVICE_TYPE_LABELS: Record<AdditionalServiceType, string> = {
  BENDING: 'Dobra',
  THREADING: 'Rosca',
  WELDING: 'Solda',
}

interface AdditionalService {
  id: string
  type: AdditionalServiceType
  name: string
  unitLabel: string
  pricePerUnit: number
  isActive: boolean
  createdAt: string
  updatedAt: string | null
}

interface Props {
  isAdmin: boolean
}

export function AdditionalServicesSettingsTab({ isAdmin }: Props) {
  const [items, setItems] = useState<AdditionalService[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [includeInactive, setIncludeInactive] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<AdditionalService | null>(null)
  const [type, setType] = useState<AdditionalServiceType>('BENDING')
  const [name, setName] = useState('')
  const [unitLabel, setUnitLabel] = useState('')
  const [pricePerUnit, setPricePerUnit] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  async function fetchList() {
    setIsLoading(true)
    try {
      const res = await api.get(`/additional-services?includeInactive=${includeInactive}`)
      setItems(res.data.additionalServices ?? [])
    } catch {
      toast.error('Erro ao carregar serviços adicionais.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchList()
  }, [includeInactive])

  function openCreate() {
    if (!isAdmin) { toast.error('Apenas administradores podem criar.'); return }
    setEditingItem(null)
    setType('BENDING')
    setName('')
    setUnitLabel('')
    setPricePerUnit('')
    setDialogOpen(true)
  }

  function openEdit(item: AdditionalService) {
    if (!isAdmin) { toast.error('Apenas administradores podem editar.'); return }
    setEditingItem(item)
    setType(item.type)
    setName(item.name)
    setUnitLabel(item.unitLabel)
    setPricePerUnit(String(item.pricePerUnit))
    setDialogOpen(true)
  }

  async function handleToggle(item: AdditionalService) {
    if (!isAdmin) { toast.error('Apenas administradores podem realizar esta ação.'); return }
    try {
      await api.patch(`/additional-services/${item.id}/toggle-active`)
      toast.success(`Serviço "${item.name}" ${item.isActive ? 'desativado' : 'ativado'} com sucesso.`)
      fetchList()
    } catch {
      toast.error('Erro ao alterar status do serviço.')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { toast.error('Nome é obrigatório.'); return }
    if (!unitLabel.trim()) { toast.error('Unidade é obrigatória.'); return }
    const price = parseFloat(pricePerUnit)
    if (isNaN(price) || price <= 0) { toast.error('Preço por unidade deve ser maior que zero.'); return }

    setIsSaving(true)
    try {
      if (editingItem) {
        await api.put(`/additional-services/${editingItem.id}`, {
          name: name.trim(),
          unitLabel: unitLabel.trim(),
          pricePerUnit: price,
        })
        toast.success('Serviço adicional atualizado com sucesso.')
      } else {
        await api.post('/additional-services', {
          type,
          name: name.trim(),
          unitLabel: unitLabel.trim(),
          pricePerUnit: price,
        })
        toast.success('Serviço adicional criado com sucesso.')
      }
      setDialogOpen(false)
      fetchList()
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Erro ao salvar.'
      toast.error(msg)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={(e) => setIncludeInactive(e.target.checked)}
            className="rounded border"
          />
          Mostrar inativos
        </label>
        <Button size="sm" onClick={openCreate}>
          + Novo Serviço
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground py-6 text-center">Carregando...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">Nenhum serviço adicional cadastrado.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead>Preço/Unidade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Badge variant="secondary">{SERVICE_TYPE_LABELS[item.type] ?? item.type}</Badge>
                </TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.unitLabel}</TableCell>
                <TableCell>
                  {item.pricePerUnit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </TableCell>
                <TableCell>
                  <Badge variant={item.isActive ? 'default' : 'outline'}>
                    {item.isActive ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(item)}>
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant={item.isActive ? 'destructive' : 'outline'}
                    onClick={() => handleToggle(item)}
                  >
                    {item.isActive ? 'Desativar' : 'Ativar'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Editar Serviço Adicional' : 'Novo Serviço Adicional'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Atualize os dados do serviço.' : 'Cadastre um novo serviço adicional.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {!editingItem && (
              <div className="space-y-2">
                <Label htmlFor="as-type">Tipo</Label>
                <Select value={type} onValueChange={(v) => setType(v as AdditionalServiceType)}>
                  <SelectTrigger id="as-type" className="w-full">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BENDING">Dobra</SelectItem>
                    <SelectItem value="THREADING">Rosca</SelectItem>
                    <SelectItem value="WELDING">Solda</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="as-name">Nome</Label>
              <Input
                id="as-name"
                placeholder="Ex: Dobramento"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="as-unit">Unidade</Label>
              <Input
                id="as-unit"
                placeholder="Ex: un, m"
                value={unitLabel}
                onChange={(e) => setUnitLabel(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="as-price">Preço por Unidade (R$)</Label>
              <Input
                id="as-price"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Ex: 10.00"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
