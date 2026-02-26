'use client'

import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api } from '@/lib/api'
import { Sheet } from '@/types/sheet'
import { useEffect, useState } from 'react'
import { translateSheetType, formatDate } from '@/lib/formatters'
import { CreateSheetModal } from '@/components/CreateSheetModal'

export default function SheetsPage() {
  const [sheets, setSheets] = useState<Sheet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'STANDARD' | 'SCRAP'>('ALL')

  async function fetchSheets() {
    setIsLoading(true)
    try {
      let response = await api.get('/sheets');

      if(activeFilter === 'STANDARD') response = await api.get('/sheets?type=STANDARD')
      else if(activeFilter === 'SCRAP') response = await api.get('/sheets?type=SCRAP')

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
  }, [activeFilter])

  return (
    <div className='p-8 max-x-6xl mx-auto space-y-0'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Estoque de Chapas</h1>
          <p className='text-muted-foreground text-sm mt-1'>Gerencie as chapas disponíveis no estoque.</p>
        </div>
        <CreateSheetModal onSuccess={fetchSheets} />
      </div>

      <div className='flex gap-2 mt-8'>
        <Button
          onClick={() => setActiveFilter('ALL')}
          className={`rounded-none bg-white text-black hover:bg-gray-100 hover:cursor-pointer border-b-2 transition-colors ${
            activeFilter === 'ALL' ? 'border-blue-600' : 'border-transparent'
            }`
          }
        >
          Tudo
        </Button>
        <Button
          onClick={() => setActiveFilter('STANDARD')}
          className={`rounded-none bg-white text-black hover:bg-gray-100 hover:cursor-pointer border-b-2 transition-colors ${
            activeFilter === 'STANDARD' ? 'border-blue-600' : 'border-transparent'
            }`
          }
        >
          Chapas
        </Button>
        <Button
          onClick={() => setActiveFilter('SCRAP')}
          className={`rounded-none bg-white text-black hover:bg-gray-100 hover:cursor-pointer border-b-2 transition-colors ${
            activeFilter === 'SCRAP' ? 'border-blue-600' : 'border-transparent'
            }`
          }
        >
          Retalhos
        </Button>
      </div>
      <div className='border rounded-md rounded-tl-none'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Cliente / Documento</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Entrada</TableHead>
              <TableHead>Quantidade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className='h-24 text-center text-muted-foreground'>
                  Carregando estoque...
                </TableCell>
              </TableRow>
            ) : sheets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className='h-24 text-center text-muted-foreground'>
                  Nenhum chapa disponível no estoque.
                </TableCell>
              </TableRow>
            ): (
              sheets.map((sheet) => (
                <TableRow key={sheet.id}>
                  <TableCell className='font-medium'>{sheet.sku}</TableCell>
                  <TableCell>
                    {sheet.client ? (
                      <div className='flex flex-col'>
                        <span className='font-medium text-zinc-900'>{sheet.client.name}</span>
                        <span className='text-sm text-zinc-500'>{sheet.client.document}</span>
                      </div>
                    ) : (
                      <span className='text-zinc-500 italic text-sm'>Estoque Próprio</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                      sheet.type === 'SCRAP'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {translateSheetType(sheet.type)}
                    </span>
                  </TableCell>
                  <TableCell className='text-muted-foreground'>
                    {formatDate(sheet.createdAt)}
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