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

interface SetupRate {
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

export function SetupRatesSettingsTab({ isAdmin }: Props) {
  const [items, setItems] = useState<SetupRate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [includeInactive, setIncludeInactive] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<SetupRate | null>(null)
  const [name, setName] = useState('')
  const [pricePerHour, setPricePerHour] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  async function fetchList() {
    setIsLoading(true)
    try {
      const res = await api.get(`/setup-rates?includeInactive=${includeInactive}`)
      setItems(res.data.setupRates ?? [])
    } catch {
      toast.error('Erro ao carregar taxas de setup.')
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

  function openEdit(item: SetupRate) {
    if (!isAdmin) { toast.error('Apenas administradores podem editar.'); return }
    setEditingItem(item)
    setName(item.name)
    setPricePerHour(String(item.pricePerHour))
    setDialogOpen(true)
  }

  async function handleToggle(item: SetupRate) {
    if (!isAdmin) { toast.error('Apenas administradores podem realizar esta ação.'); return }
    try {
      await api.patch(`/setup-rates/${item.id}/toggle-active`)
      toast.success(`Taxa "${item.name}" ${item.isActive ? 'desativada' : 'ativada'} com sucesso.`)
      fetchList()
    } catch {
      toast.error('Erro ao alterar status da taxa.')
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
        await api.put(`/setup-rates/${editingItem.id}`, { name: name.trim(), pricePerHour: price })
        toast.success('Taxa de setup atualizada com sucesso.')
      } else {
        await api.post('/setup-rates', { name: name.trim(), pricePerHour: price })
        toast.success('Taxa de setup criada com sucesso.')
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
          + Nova Taxa
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground py-6 text-center">Carregando...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">Nenhuma taxa de setup cadastrada.</p>
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
            <DialogTitle>{editingItem ? 'Editar Taxa de Setup' : 'Nova Taxa de Setup'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'Atualize os dados da taxa de setup.' : 'Cadastre uma nova taxa de setup.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="sr-name">Nome</Label>
              <Input
                id="sr-name"
                placeholder="Ex: Setup Padrão"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sr-price">Preço por Hora (R$)</Label>
              <Input
                id="sr-price"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Ex: 50.00"
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
