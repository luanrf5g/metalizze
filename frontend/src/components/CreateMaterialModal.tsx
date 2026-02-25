'use client'

import { api } from "@/lib/api"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { Input } from "./ui/input"

interface CreateMaterialModalProps {
  onSuccess: () => void
}

export function CreateMaterialModal({ onSuccess }: CreateMaterialModalProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function handleCreateMaterial(e: React.ChangeEvent) {
    e.preventDefault()
    setIsLoading(true)
    try {
      await api.post('/materials', { name })

      setName("")
      setOpen(false)
      onSuccess()
    } catch (error) {
      console.error('Erro ao criar material: ', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="hover:cursor-pointer">Adicionar Material</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Novo Material</DialogTitle>
          <DialogDescription>
            Cadastre um novo tipo de material para vincular às suas chapas.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreateMaterial} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Material</Label>
            <Input
              id="name"
              placeholder="Ex: Aço Inox 304"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
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
              {isLoading ? 'Salvando...' : 'Salvar Material'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}