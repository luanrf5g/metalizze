'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Trash2Icon, PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  fetchAdditionalServices,
  replaceQuoteItemServices,
  type AdditionalServiceOption,
} from '@/lib/quotes-api'
import { formatCurrency } from '@/lib/formatters'
import type { QuoteDTO, QuoteItemDTO, QuoteItemServiceDTO } from '@/types/quote'

interface QuoteItemServicesModalProps {
  open: boolean
  onClose: () => void
  quoteId: string
  item: QuoteItemDTO
  onSaved: (quote: QuoteDTO) => void
}

interface ServiceRow {
  serviceId: string
  quantity: number
  unitPrice: number
}

export function QuoteItemServicesModal({
  open,
  onClose,
  quoteId,
  item,
  onSaved,
}: QuoteItemServicesModalProps) {
  const [services, setServices] = useState<ServiceRow[]>([])
  const [availableServices, setAvailableServices] = useState<AdditionalServiceOption[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (open) {
      fetchAdditionalServices()
        .then(setAvailableServices)
        .catch(() => toast.error('Erro ao carregar serviços.'))

      setServices(
        item.services.map((s: QuoteItemServiceDTO) => ({
          serviceId: s.serviceId,
          quantity: s.quantity,
          unitPrice: s.unitPrice,
        })),
      )
    }
  }, [open, item])

  function addRow() {
    setServices((prev) => [...prev, { serviceId: '', quantity: 1, unitPrice: 0 }])
  }

  function removeRow(index: number) {
    setServices((prev) => prev.filter((_, i) => i !== index))
  }

  function updateRow(index: number, field: keyof ServiceRow, value: string | number) {
    setServices((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row
        if (field === 'serviceId') {
          const svc = availableServices.find((s) => s.id === value)
          return { ...row, serviceId: value as string, unitPrice: svc ? svc.pricePerUnit : row.unitPrice }
        }
        return { ...row, [field]: value }
      }),
    )
  }

  async function handleSave() {
    for (const row of services) {
      if (!row.serviceId) { toast.error('Selecione um serviço em todas as linhas.'); return }
      if (row.quantity < 1) { toast.error('Quantidade deve ser pelo menos 1.'); return }
    }
    setIsSaving(true)
    try {
      const quote = await replaceQuoteItemServices(
        quoteId,
        item.id,
        services.map((s) => ({ serviceId: s.serviceId, quantity: s.quantity, unitPrice: s.unitPrice })),
      )
      toast.success('Serviços atualizados com sucesso!')
      onSaved(quote)
      onClose()
    } catch {
      toast.error('Erro ao salvar serviços.')
    } finally {
      setIsSaving(false)
    }
  }

  const total = services.reduce((sum, s) => sum + s.quantity * s.unitPrice, 0)

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Serviços do Item #{item.partNumber}</DialogTitle>
          <DialogDescription>
            {item.materialName} — gerencie os serviços adicionais deste item.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {services.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serviço</TableHead>
                    <TableHead className="w-24">Qtd</TableHead>
                    <TableHead className="w-32">Preço unit.</TableHead>
                    <TableHead className="w-32">Subtotal</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Select
                          value={row.serviceId || 'none'}
                          onValueChange={(v) => updateRow(i, 'serviceId', v === 'none' ? '' : v)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecionar…" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">—</SelectItem>
                            {availableServices.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.name} / {s.unitLabel}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={row.quantity}
                          onChange={(e) => updateRow(i, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-full"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={row.unitPrice}
                          onChange={(e) => updateRow(i, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full"
                        />
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {formatCurrency(row.quantity * row.unitPrice)}
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRow(i)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2Icon className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum serviço adicionado.
            </p>
          )}

          <Button type="button" variant="outline" size="sm" onClick={addRow}>
            <PlusIcon className="size-4 mr-1" />
            Adicionar Serviço
          </Button>

          {services.length > 0 && (
            <div className="text-sm text-right text-muted-foreground">
              Total dos serviços: <span className="font-semibold text-foreground">{formatCurrency(total)}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Salvando…' : 'Salvar Serviços'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
