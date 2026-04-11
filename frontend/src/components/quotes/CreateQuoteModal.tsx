'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { api } from '@/lib/api'
import { createQuote } from '@/lib/quotes-api'
import type { Client } from '@/types/clients'
import type { DiscountType } from '@/types/quote'

interface CreateQuoteModalProps {
  onCreated?: (quoteId: string) => void
}

export function CreateQuoteModal({ onCreated }: CreateQuoteModalProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [notes, setNotes] = useState('')
  const [validUntil, setValidUntil] = useState('')
  const [clientId, setClientId] = useState<string | null>(null)
  const [discountType, setDiscountType] = useState<DiscountType | null>(null)
  const [discountValue, setDiscountValue] = useState('')
  const [clients, setClients] = useState<Client[]>([])

  useEffect(() => {
    if (open) {
      api.get('/clients').then((r) => setClients(r.data.clients ?? [])).catch(() => {})
    }
  }, [open])

  function resetForm() {
    setNotes('')
    setValidUntil('')
    setClientId(null)
    setDiscountType(null)
    setDiscountValue('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    try {
      const quote = await createQuote({
        notes: notes.trim() || null,
        validUntil: validUntil || null,
        clientId: clientId || null,
        discountType: discountType || null,
        discountValue: discountValue ? parseFloat(discountValue) : null,
      })
      toast.success('Orçamento criado com sucesso!')
      setOpen(false)
      resetForm()
      if (onCreated) {
        onCreated(quote.id)
      } else {
        router.push(`/quotes/${quote.id}`)
      }
    } catch {
      toast.error('Erro ao criar orçamento.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="hover:cursor-pointer">
          <PlusIcon className="size-4 mr-1" />
          Novo Orçamento
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo Orçamento</DialogTitle>
          <DialogDescription>
            Crie um rascunho de orçamento. Você poderá adicionar itens depois.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="client">Cliente (opcional)</Label>
            <Select
              value={clientId ?? 'none'}
              onValueChange={(v) => setClientId(v === 'none' ? null : v)}
            >
              <SelectTrigger id="client" className="w-full">
                <SelectValue placeholder="Selecionar cliente…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— Sem cliente —</SelectItem>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Notas internas sobre o orçamento…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="validUntil">Válido até (opcional)</Label>
            <Input
              id="validUntil"
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Tipo de desconto</Label>
              <Select
                value={discountType ?? 'none'}
                onValueChange={(v) => {
                  setDiscountType(v === 'none' ? null : (v as DiscountType))
                  if (v === 'none') setDiscountValue('')
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sem desconto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem desconto</SelectItem>
                  <SelectItem value="PERCENT">Percentual (%)</SelectItem>
                  <SelectItem value="AMOUNT">Valor fixo (R$)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="discountValue">Valor do desconto</Label>
              <Input
                id="discountValue"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                disabled={!discountType}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Criando…' : 'Criar Orçamento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
