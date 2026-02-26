'use client'

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { AlertCircleIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { CreateMaterialModal } from "@/components/CreateMaterialModal";
import { Client } from "@/types/clients";

export default function MaterialsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  async function fetchClients() {
    setIsLoading(true)
    setHasError(false)
    try {
      const response = await api.get('/clients')
      setClients(response.data.clients)

    } catch (error) {
      console.error('Erro ao buscar os Materiais: ', error)
      setHasError(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
    console.log(clients)
  }, [])

  return (
    <div className='p-8 max-x-6xl mx-auto space-y-6'>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
        <CreateMaterialModal onSuccess={fetchClients} />
      </div>

      {hasError && (
        <Alert variant="destructive">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>
            Erro ao tentar buscar a lista de materiais. Tente novamente após alguns momentos.
          </AlertDescription>
        </Alert>
      )}

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Id</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className='h-24 text-center text-muted-foreground'>
                  Carregando estoque...
                </TableCell>
              </TableRow>
            ) : clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className='h-24 text-center text-muted-foreground'>
                  Lista de Materiais vazia. Cadastre um novo material para vincular às chapas.
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-bold">{client.name}</TableCell>
                  <TableCell>{client.document}</TableCell>
                  <TableCell>{client.id}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}