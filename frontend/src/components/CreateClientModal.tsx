'use client'

import { api } from "@/lib/api"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { toast } from "sonner"

interface CreateClientModalProps {
  onSuccess: () => void
}

export function CreateClientModal({ onSuccess }: CreateClientModalProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [document, setDocument] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function handleCreateMaterial(e: React.ChangeEvent) {
    e.preventDefault()
    setIsLoading(true)
    try {
      await api.post('/clients', {
        name,
        document,
        email,
        phone
      })

      setName("")
      setDocument("")
      setEmail("")
      setPhone("")
      setOpen(false)
      onSuccess()
      toast.success("Cliente cadastrado com sucesso!", {
        duration: 2000
      })
    } catch (error) {
      console.error('Erro ao cadastrar cliente: ', error)
      toast.error('Erro ao cadastrar cliente. Verifique os dados.', {
        duration: 2000
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="hover:cursor-pointer">Cadastrar Cliente</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Novo Cliente</DialogTitle>
          <DialogDescription>
            Cadastre um novo cliente em seu banco de dados.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreateMaterial} className="space-y-4 mt-4">
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
              <Label htmlFor="name">Documento ( CPF / CNPJ )</Label>
              <Input
                id="document"
                placeholder="Sem ponto e sem vírgula"
                value={document}
                onChange={(e) => setDocument(e.target.value)}
                required
              />
            </div>


            <div className="space-y-2">
              <Label htmlFor="name">E-mail ( opcional )</Label>
              <Input
                id="email"
                placeholder="Ex: johndoe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Telefone ( opcional )</Label>
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
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? 'Cadastrando...' : 'Cadastrar Cliente'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}