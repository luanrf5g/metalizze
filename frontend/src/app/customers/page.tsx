'use client'

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { AlertCircleIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { CreateMaterialModal } from "@/components/CreateMaterialModal";
import { Client } from "@/types/clients";
import { CreateClientModal } from "@/components/CreateClientModal";
import { formatDocument } from "@/lib/formatters";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
    <div className='p-6 md:p-10 max-w-7xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-700'>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400 pb-1">
            Clientes
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-base font-medium mt-2">
            Banco de clientes cadastrados.
          </p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Buscar cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white/50 dark:bg-black/20"
            />
          </div>
          <CreateClientModal onSuccess={fetchClients} />
        </div>
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

      <div className="glass-card overflow-hidden flex-1 min-h-0 flex flex-col p-1">
        <div className="overflow-auto hide-v-scroll flex-1 relative rounded-2xl">
            <Table>
              <TableHeader className="bg-zinc-50/80 backdrop-blur-md dark:bg-zinc-900/80">
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
              ) : clients.filter(c => {
                    if (!searchQuery) return true;
                    const query = searchQuery.toLowerCase();
                    return c.name.toLowerCase().includes(query) || formatDocument(c.document).includes(query);
                  }).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className='h-24 text-center text-muted-foreground'>
                    Nenhum cliente encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                clients.filter(c => {
                    if (!searchQuery) return true;
                    const query = searchQuery.toLowerCase();
                    return c.name.toLowerCase().includes(query) || formatDocument(c.document).includes(query);
                  }).map((client) => (
                  <TableRow key={client.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b border-white/20 dark:border-white/5">
                    <TableCell className="font-semibold text-zinc-900 dark:text-zinc-100">{client.name}</TableCell>
                    <TableCell className="text-zinc-600 dark:text-zinc-400">{formatDocument(client.document)}</TableCell>
                    <TableCell className="text-zinc-400 dark:text-zinc-500 text-xs font-mono">{client.id}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}