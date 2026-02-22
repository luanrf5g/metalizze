'use client'

import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api } from '@/lib/api'
import { Sheet } from '@/types/sheet'
import { useEffect, useState } from 'react'

export default function SheetsPage() {
  const [sheets, setSheets] = useState<Sheet[]>([])
  const [isLoading, setIsLoading] = useState(true)

  async function fetchSheets() {
    try {
      const response = await api.get('/sheets')
      setSheets(response.data.sheets)
    } catch (error) {
      console.error('Erro ao buscar chapas: ', error)
      alert('Erro ao buscar chapas do estoque.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSheets()
  }, [])

  return (
    <div className='p-8 max-x-6xl mx-auto space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Estoque de Chapas</h1>
          <p className='text-muted-foreground text-sm mt-1'>Gerencie as chapas disponíveis no estoque.</p>
        </div>
        <Button>Adicionar Chapa</Button>
      </div>

      <div className='border rounded-md'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Quantidade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className='h-24 text-muted-foreground'>
                  Carregando estoque...
                </TableCell>
              </TableRow>
            ) : sheets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className='h-24 text-muted-foreground'>
                  Nenhum chapa disponível no estoque.
                </TableCell>
              </TableRow>
            ): (
              sheets.map((sheet) => (
                <TableRow key={sheet.id}>
                  <TableCell className='font-medium'>{sheet.sku}</TableCell>
                  <TableCell>{sheet.clientId || 'Estoque'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                      sheet.type === 'SCRAP'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {sheet.type}
                    </span>
                  </TableCell>
                  <TableCell className='font-bold'>{sheet.quantity}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}