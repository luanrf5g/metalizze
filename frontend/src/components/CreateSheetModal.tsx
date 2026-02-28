'use client'

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Material } from "@/types/material";
import { api } from "@/lib/api";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Client } from "@/types/clients";
import { toast } from "sonner";

interface CreateSheetModalProps {
  onSuccess: () => void
}

export function CreateSheetModal({ onSuccess }: CreateSheetModalProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [materials, setMaterials] = useState<Material[]>([])
  const [clients, setClients] = useState<Client[]>([])

  const [materialId, setMaterialId] = useState("")
  const [clientId, setClientId] = useState("none")
  const [width, setWidth] = useState("")
  const [height, setHeight] = useState("")
  const [thickness, setThickness] = useState("")
  const [quantity, setQuantity] = useState("")

  async function handleCreateSheet(e: React.ChangeEvent) {
    e.preventDefault()
    setIsLoading(true)
    try {
      await api.post('/sheets', {
        materialId,
        clientId: clientId === 'none' ? null : clientId,
        width: Number(width),
        height: Number(height),
        thickness: Number(thickness),
        quantity: Number(quantity)
      })

      setMaterialId("")
      setClientId("none")
      setWidth("")
      setHeight("")
      setThickness("")
      setQuantity("")
      setOpen(false)
      onSuccess()
      toast.success("Chapa cadastrada com sucesso!", {
        duration: 2000
      })
    } catch (error) {
      console.log('Erro ao cadastrar uma nova chapa.')
      toast.error("Erro ao tentar cadastrar a chapa. Verifique os dados.", {
        duration: 2000
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchMaterials() {
    try {
      const response = await api.get('/materials')
      setMaterials(response.data.materials)
    } catch (error) {
      console.error('Erro ao buscar materiais: ', error)
    }
  }

  async function fetchClients() {
    try {
      const response = await api.get('/clients')
      setClients(response.data.clients)
    } catch (error) {
      console.log('Erro ao buscar clientes: ', error)
    }
  }

  useEffect(() => {
    fetchMaterials()
    fetchClients()
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="hover:cursor-pointer">Adicionar Chapa</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogTitle>Adicionar Chapa</DialogTitle>
        <DialogDescription>
          Cadastre uma nova chapa para ser adicionada ao seu estoque.
        </DialogDescription>

        <form onSubmit={handleCreateSheet} className="space-y-4 mt-4">
          {/* Select for Materials */}
          <div className="space-y-2">
            <Label htmlFor="material">Material</Label>
            <Select value={materialId} onValueChange={setMaterialId}>
              <SelectTrigger className="w-full max-w-64">
                <SelectValue placeholder="Selecione um Material" />
              </SelectTrigger>
              <SelectContent>
                {materials.map((material) => (
                  <SelectItem
                    key={material.id}
                    value={material.id}
                  >
                    {material.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Inputs for Dimensions */}
          <div className="flex items-center justify-between">
            {/* Input for Width */}
            <div className="space-y-2">
              <Label htmlFor="width">Altura</Label>
              <Input
                id="height"
                type="number"
                placeholder="Altura em mm (Ex: 3000)"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                required
              />
            </div>

            {/* Input for Height */}
            <div className="space-y-2">
              <Label htmlFor="height">Largura</Label>
              <Input
                id="width"
                type="number"
                placeholder="Largura em mm (Ex: 1200)"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Input for thickness and quantity */}
          <div className="flex items-center justify-between">
            {/* Input for Thickness */}
            <div className="space-y-2">
              <Label htmlFor='thickness'>Espessura</Label>
              <Input
                id="thickness"
                type="number"
                placeholder="Espessura em mm (Ex: 4.75)"
                value={thickness}
                onChange={(e) => setThickness(e.target.value)}
                required
              />
            </div>

            {/* Input for Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="Quantidade de Chapas"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientId">Cliente</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger className="w-full max-w-64">
                <SelectValue placeholder="Selecione um Cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Cliente</SelectLabel>
                  <SelectItem value="none">Estoque Próprio</SelectItem>
                  {clients.map((client) => (
                    <SelectItem
                      key={client.id}
                      value={client.id}
                    >
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant='outline'
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type='submit' className="hover:cursor-pointer">
              {isLoading ? 'Cadastrando...' : 'Cadastrar Chapa'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}