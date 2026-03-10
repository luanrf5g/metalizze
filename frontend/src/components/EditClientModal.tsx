'use client'

import { api } from "@/lib/api"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { toast } from "sonner"
import { Client } from "@/types/clients"

interface EditClientModalProps {
  client: Client
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditClientModal({ client, open, onOpenChange, onSuccess }: EditClientModalProps) {
  const [name, setName] = useState(client.name)
  const [document, setDocument] = useState(client.document)
  const [email, setEmail] = useState(client.email || "")
  const [phone, setPhone] = useState(client.phone || "")
  const [isLoading, setIsLoading] = useState(false)

  async function handleEditClient(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    try {
      await api.put(`/clients/${client.id}`, {
        name,
        document,
        email: email || null,
        phone: phone || null
      })

      onOpenChange(false)
      onSuccess()
      toast.success("Cliente atualizado com sucesso!", {
        duration: 2000
      })
    } catch (error) {
      console.error('Erro ao atualizar cliente: ', error)
      toast.error('Erro ao atualizar cliente. Verifique os dados.', {
        duration: 2000
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
          <DialogDescription>
            Atualize as informações do cliente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleEditClient} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Cliente</Label>
            <Input
              id="name"
              placeholder="Ex: John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="document">Documento ( CPF / CNPJ )</Label>
            <Input
              id="document"
              placeholder="Sem ponto e sem vírgula"
              value={document}
              onChange={(e) => setDocument(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail ( opcional )</Label>
            <Input
              id="email"
              type="email"
              placeholder="Ex: johndoe@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone ( opcional )</Label>
            <Input
              id="phone"
              placeholder="Sem espaço e/ou hífen"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant={'outline'}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
