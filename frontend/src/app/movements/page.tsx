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


export default function MovementsPage() {
  const [movements, setMovements] = useState<InventoryMovements[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  async function fetchMovements() {
    setIsLoading(true)
    try {
      const response = await api.get('/movements')
      setMovements(response.data.movements)
    } catch (error) {
      console.error('Erro ao buscar movimentos do inventário.')
      setHasError(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMovements()
  }, [])

  return (
    <div className="p-8 max-x-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Movimentações do Inventário</h1>
          <p className="text-muted-foreground text-sm mt-1">Visualize todas as movimentações que tiveram no seu inventário.</p>
        </div>
        <CreateMovementModal onSuccess={fetchMovements}/>
      </div>

      {hasError ?? (
        <Alert variant='destructive' className="max-w-md">
          <AlertCircleIcon />
          <AlertTitle>Erro na Busca</AlertTitle>
          <AlertDescription>
            Ocorreu um erro na busca das movimentações do seu inventário. Tente novamente após alguns minutos.
          </AlertDescription>
        </Alert>
      )}

      <div className="border rounded-md">
        <Table >
          <TableHeader>
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
                  Sem movimentações realizadas no inventário.
                </TableCell>
              </TableRow>
            ) : (
              movements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell>{movement.description}</TableCell>
                  <TableCell>{movement.sheetId}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium ${
                        movement.type === 'ENTRY'
                          ? `bg-green-200 text-green-600`
                          : `bg-red-200 text-red-600`
                        }
                      `}
                    >
                      {movement.type}
                    </span>
                  </TableCell>
                  <TableCell>{movement.quantity}</TableCell>
                  <TableCell>{formatDate(movement.createdAt, true)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}