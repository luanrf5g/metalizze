'use client'

import { CreateMovementModal } from "@/components/CreateMovementModal";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/formatters";
import { InventoryMovements } from "@/types/movements";
import { AlertCircleIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Pagination } from "@/components/Pagination";

export default function MovementsPage() {
  const [movements, setMovements] = useState<InventoryMovements[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  async function fetchMovements(currentPage: number = page) {
    setIsLoading(true)
    try {
      const response = await api.get(`/movements?page=${currentPage}`)

      const newMovements = response.data.movements || []
      setMovements(newMovements)

      // Assumes the API returns 20 items per page as requested. If less than 20 are returned, it's the last page.
      setHasMore(newMovements.length === 20)
    } catch (error) {
      console.error('Erro ao buscar movimentos do inventário.')
      setHasError(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMovements(page)
  }, [page])

  return (
    <div className="p-6 md:p-10 w-full h-full mx-auto flex flex-col animate-in fade-in zoom-in-95 duration-700">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between shrink-0 mb-6 gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400 pb-1">Movimentações</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mt-1">Visualize todas as movimentações que tiveram no seu inventário.</p>
        </div>
        <CreateMovementModal onSuccess={() => fetchMovements(page)}/>
      </div>

      {hasError && (
        <Alert variant='destructive' className="max-w-md shrink-0 mb-6">
          <AlertCircleIcon />
          <AlertTitle>Erro na Busca</AlertTitle>
          <AlertDescription>
            Ocorreu um erro na busca das movimentações do seu inventário. Tente novamente após alguns minutos.
          </AlertDescription>
        </Alert>
      )}

      <div className="glass-card overflow-hidden flex-1 min-h-0 flex flex-col p-1">
        <div className="overflow-auto hide-v-scroll flex-1 relative rounded-2xl">
          <Table className="min-w-[800px]">
            <TableHeader className="sticky top-0 z-10 bg-zinc-50/80 backdrop-blur-md dark:bg-zinc-900/80">
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>ID Chapa</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-muted-foreground text-center">
                    Carregando movimentações...
                  </TableCell>
                </TableRow>
              ) : movements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Sem movimentações realizadas no inventário nesta página.
                  </TableCell>
                </TableRow>
              ) : (
                movements.map((movement) => (
                  <TableRow key={movement.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b border-white/20 dark:border-white/5">
                    <TableCell className="max-w-[300px] truncate text-zinc-900 dark:text-zinc-100 font-medium">{movement.description}</TableCell>
                    <TableCell className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{movement.sheetId}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm ${
                          movement.type === 'ENTRY'
                            ? `bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300`
                            : `bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300`
                          }
                        `}
                      >
                        {movement.type === 'ENTRY' ? 'Entrada' : 'Saída'}
                      </span>
                    </TableCell>
                    <TableCell className="font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">{movement.quantity}</TableCell>
                    <TableCell className="text-zinc-500 dark:text-zinc-400 whitespace-nowrap">{formatDate(movement.createdAt, true)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {!isLoading && (movements.length > 0 || page > 1) && (
        <div className="mt-4 shrink-0">
          <Pagination
            currentPage={page}
            hasMore={hasMore}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}