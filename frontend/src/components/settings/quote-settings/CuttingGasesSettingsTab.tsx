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

interface CuttingGas {
  id: string
  name: string
  pricePerHour: number
  isActive: boolean
  createdAt: string
  updatedAt: string | null
}

interface Props {
  isAdmin: boolean
}

export function CuttingGasesSettingsTab({ isAdmin }: Props) {
  const [items, setItems] = useState<CuttingGas[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [includeInactive, setIncludeInactive] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<CuttingGas | null>(null)
  const [name, setName] = useState('')
  const [pricePerHour, setPricePerHour] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  async function fetchList() {
    setIsLoading(true)
    try {
      const res = await api.get(`/cutting-gases?includeInactive=${includeInactive}`)
      setItems(res.data.cuttingGases ?? [])
    } catch {
      toast.error('Erro ao carregar gases de corte.')
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
    setName('')
    setPricePerHour('')
    setDialogOpen(true)
  }

  function openEdit(item: CuttingGas) {
    if (!isAdmin) { toast.error('Apenas administradores podem editar.'); return }
    setEditingItem(item)
    setName(item.name)
    setPricePerHour(String(item.pricePerHour))
    setDialogOpen(true)
  }

  async function handleToggle(item: CuttingGas) {
    if (!isAdmin) { toast.error('Apenas administradores podem realizar esta ação.'); return }
    try {
      await api.patch(`/cutting-gases/${item.id}/toggle-active`)
      toast.success(`Gás "${item.name}" ${item.isActive ? 'desativado' : 'ativado'} com sucesso.`)
      fetchList()
    } catch {
      toast.error('Erro ao alterar status do gás.')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { toast.error('Nome é obrigatório.'); return }
    const price = parseFloat(pricePerHour)
    if (isNaN(price) || price <= 0) { toast.error('Preço por hora deve ser maior que zero.'); return }

    setIsSaving(true)
    try {
      if (editingItem) {
        await api.put(`/cutting-gases/${editingItem.id}`, { name: name.trim(), pricePerHour: price })
        toast.success('Gás de corte atualizado com sucesso.')
      } else {
        await api.post('/cutting-gases', { name: name.trim(), pricePerHour: price })
        toast.success('Gás de corte criado com sucesso.')
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
          + Novo Gás
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground py-6 text-center">Carregando...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">Nenhum gás de corte cadastrado.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Preço/Hora</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>
                  {item.pricePerHour.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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
            <DialogTitle>{editingItem ? 'Editar Gás de Corte' : 'Novo Gás de Corte'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Atualize os dados do gás de corte.' : 'Cadastre um novo gás de corte.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="cg-name">Nome</Label>
              <Input
                id="cg-name"
                placeholder="Ex: Oxigênio"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cg-price">Preço por Hora (R$)</Label>
              <Input
                id="cg-price"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Ex: 25.00"
                value={pricePerHour}
                onChange={(e) => setPricePerHour(e.target.value)}
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
