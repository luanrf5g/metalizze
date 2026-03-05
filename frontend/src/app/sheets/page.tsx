'use client'

import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api } from '@/lib/api'
import { Sheet } from '@/types/sheet'
import { useEffect, useState } from 'react'
import { translateSheetType, formatDate, formatDocument } from '@/lib/formatters'
import { CreateSheetModal } from '@/components/CreateSheetModal'
import { Pagination } from '@/components/Pagination'
import { MoreHorizontal, Eye, Scissors } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from 'next/link'

export default function SheetsPage() {
  const [sheets, setSheets] = useState<Sheet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'STANDARD' | 'SCRAP'>('ALL')

  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  async function fetchSheets(currentPage: number = page) {
    setIsLoading(true)
    try {
      let route = `/sheets?page=${currentPage}`

      if(activeFilter === 'STANDARD') route += '&type=STANDARD'
      else if(activeFilter === 'SCRAP') route += '&type=SCRAP'

      let response = await api.get(route)

      const newSheets = response.data.sheets || []
      setSheets(newSheets)

      // Assumes the API returns 20 items per page as requested. If less than 20 are returned, it's the last page.
      setHasMore(newSheets.length === 20)
    } catch (error) {
      console.error('Erro ao buscar chapas: ', error)
      alert('Erro ao buscar chapas do estoque.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setPage(1) // Reset page on filter change
    fetchSheets(1)
  }, [activeFilter])

  useEffect(() => {
    fetchSheets(page)
  }, [page])

  return (
    <div className='p-8 w-full h-full mx-auto flex flex-col'>
      <div className='flex items-center justify-between shrink-0'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Estoque de Chapas</h1>
          <p className='text-muted-foreground text-sm mt-1'>Gerencie as chapas disponíveis no estoque.</p>
        </div>
        <CreateSheetModal onSuccess={() => fetchSheets(page)} />
      </div>

      <div className='flex gap-2 mt-8 overflow-x-auto pb-2'>
        <Button
          onClick={() => setActiveFilter('ALL')}
          className={`shrink-0 rounded-none bg-white text-black hover:bg-gray-100 hover:cursor-pointer border-b-2 transition-colors ${
            activeFilter === 'ALL' ? 'border-blue-600' : 'border-transparent'
            }`
          }
        >
          Tudo
        </Button>
        <Button
          onClick={() => setActiveFilter('STANDARD')}
          className={`shrink-0 rounded-none bg-white text-black hover:bg-gray-100 hover:cursor-pointer border-b-2 transition-colors ${
            activeFilter === 'STANDARD' ? 'border-blue-600' : 'border-transparent'
            }`
          }
        >
          Chapas
        </Button>
        <Button
          onClick={() => setActiveFilter('SCRAP')}
          className={`shrink-0 rounded-none bg-white text-black hover:bg-gray-100 hover:cursor-pointer border-b-2 transition-colors ${
            activeFilter === 'SCRAP' ? 'border-blue-600' : 'border-transparent'
            }`
          }
        >
          Retalhos
        </Button>
      </div>

      <div className='border rounded-md rounded-tl-none overflow-hidden flex-1 min-h-0 flex flex-col'>
        <div className="overflow-auto flex-1 relative">
          <Table className="min-w-[800px]">
            <TableHeader className="sticky top-0 z-10 bg-zinc-50 shadow-sm">
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Cliente / Documento</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Entrada</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Ações</TableHead>
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
                    Nenhuma chapa disponível nesta página.
                  </TableCell>
                </TableRow>
              ): (
                sheets.map((sheet) => (
                  <TableRow key={sheet.id}>
                    <TableCell className='font-medium' title={sheet.sku}>
                      {sheet.sku.split('-C:')[0]}
                    </TableCell>
                    <TableCell>
                      {sheet.client ? (
                        <div className='flex flex-col'>
                          <span className='font-medium text-zinc-900 truncate max-w-[200px]'>{sheet.client.name}</span>
                          <span className='text-sm text-zinc-500'>{formatDocument(sheet.client.document)}</span>
                        </div>
                      ) : (
                        <span className='text-zinc-500 italic text-sm'>Estoque Próprio</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
                        sheet.type === 'SCRAP'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {translateSheetType(sheet.type)}
                      </span>
                    </TableCell>
                    <TableCell className='text-muted-foreground whitespace-nowrap'>
                      {formatDate(sheet.createdAt)}
                    </TableCell>
                    <TableCell className='font-bold whitespace-nowrap'>{sheet.quantity} un</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações da Chapa</DropdownMenuLabel>
                          <DropdownMenuItem asChild className="cursor-pointer">
                            <Link href="#">
                              <Eye className="mr-2 h-4 w-4" />
                              Ver detalhes
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild className="cursor-pointer font-medium text-blue-600 focus:text-blue-600 focus:bg-blue-50">
                            <Link href={`/cut-orders?sheetId=${sheet.id}`}>
                              <Scissors className="mr-2 h-4 w-4" />
                              Cortar chapa
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {!isLoading && (sheets.length > 0 || page > 1) && (
        <Pagination
          currentPage={page}
          hasMore={hasMore}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}