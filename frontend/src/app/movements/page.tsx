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
    <div className="p-8 w-full h-full mx-auto flex flex-col">
      <div className="flex items-center justify-between shrink-0 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Movimentações do Inventário</h1>
          <p className="text-muted-foreground text-sm mt-1">Visualize todas as movimentações que tiveram no seu inventário.</p>
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

      <div className="border rounded-md overflow-hidden flex-1 min-h-0 flex flex-col">
        <div className="overflow-auto flex-1 relative">
          <Table className="min-w-[800px]">
            <TableHeader className="sticky top-0 z-10 bg-zinc-50 shadow-sm">
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
                  <TableRow key={movement.id}>
                    <TableCell className="max-w-[300px] truncate">{movement.description}</TableCell>
                    <TableCell className="font-mono text-xs">{movement.sheetId}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
                          movement.type === 'ENTRY'
                            ? `bg-green-100 text-green-800`
                            : `bg-red-100 text-red-800`
                          }
                        `}
                      >
                        {movement.type === 'ENTRY' ? 'Entrada' : 'Saída'}
                      </span>
                    </TableCell>
                    <TableCell className="font-bold whitespace-nowrap">{movement.quantity}</TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">{formatDate(movement.createdAt, true)}</TableCell>
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