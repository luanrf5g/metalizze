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

import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export default function SheetsPage() {
  const [sheets, setSheets] = useState<Sheet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'STANDARD' | 'SCRAP'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  async function fetchSheets(currentPage: number = page) {
    setIsLoading(true)
    try {
      let route = `/sheets?page=${currentPage}`

      if(activeFilter === 'STANDARD') route += '&type=STANDARD'
      else if(activeFilter === 'SCRAP') route += '&type=SCRAP'

      const response = await api.get(route)

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
    <div className='p-6 md:p-10 w-full h-full mx-auto flex flex-col space-y-6 animate-in fade-in zoom-in-95 duration-700'>
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between shrink-0 gap-4'>
        <div>
          <h1 className='text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400 pb-1'>Estoque de Chapas</h1>
          <p className='text-zinc-500 dark:text-zinc-400 text-sm font-medium mt-1'>Gerencie as chapas disponíveis no estoque.</p>
        </div>
        <CreateSheetModal onSuccess={() => fetchSheets(page)} />
      </div>

      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0'>
        {/* Apple Style Segmented Control */}
        <div className='flex p-1 bg-black/5 dark:bg-white/10 backdrop-blur-md rounded-xl w-full md:w-auto overflow-hidden'>
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`flex-1 md:flex-none px-6 py-2 text-sm font-medium rounded-lg transition-all duration-300 hover:cursor-pointer ${
              activeFilter === 'ALL' ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Tudo
          </button>
          <button
            onClick={() => setActiveFilter('STANDARD')}
            className={`flex-1 md:flex-none px-6 py-2 text-sm font-medium rounded-lg transition-all duration-300 hover:cursor-pointer ${
              activeFilter === 'STANDARD' ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Chapas
          </button>
          <button
            onClick={() => setActiveFilter('SCRAP')}
            className={`flex-1 md:flex-none px-6 py-2 text-sm font-medium rounded-lg transition-all duration-300 hover:cursor-pointer ${
              activeFilter === 'SCRAP' ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Retalhos
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Buscar por SKU ou Cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white/50 dark:bg-black/20"
          />
        </div>
      </div>

      <div className='glass-card overflow-hidden flex-1 min-h-0 flex flex-col p-1'>
        <div className="overflow-auto hide-v-scroll flex-1 relative rounded-2xl">
          <Table className="min-w-[800px]">
            <TableHeader className="sticky top-0 z-10 bg-zinc-50/80 backdrop-blur-md dark:bg-zinc-900/80">
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
                sheets.filter(s => {
                  if (!searchQuery) return true;
                  const query = searchQuery.toLowerCase();
                  return s.sku.toLowerCase().includes(query) || (s.client?.name && s.client.name.toLowerCase().includes(query));
                }).map((sheet) => (
                  <TableRow key={sheet.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b border-white/20 dark:border-white/5">
                    <TableCell className='font-medium text-zinc-900 dark:text-zinc-100' title={sheet.sku}>
                      {sheet.sku.split('-C:')[0]}
                    </TableCell>
                    <TableCell>
                      {sheet.client ? (
                        <div className='flex flex-col'>
                          <span className='font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-[200px]'>{sheet.client.name}</span>
                          <span className='text-sm text-zinc-500 dark:text-zinc-400'>{formatDocument(sheet.client.document)}</span>
                        </div>
                      ) : (
                        <span className='text-zinc-500 italic text-sm'>Estoque Próprio</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm ${
                        sheet.type === 'SCRAP'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                      }`}>
                        {translateSheetType(sheet.type)}
                      </span>
                    </TableCell>
                    <TableCell className='text-zinc-500 dark:text-zinc-400 whitespace-nowrap'>
                      {formatDate(sheet.createdAt)}
                    </TableCell>
                    <TableCell className='font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap'>{sheet.quantity} un</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass-panel border-white/20 rounded-xl">
                          <DropdownMenuLabel className="font-semibold">Ações da Chapa</DropdownMenuLabel>
                          <DropdownMenuItem asChild className="cursor-pointer rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
                            <Link href="#">
                              <Eye className="mr-2 h-4 w-4" />
                              Ver detalhes
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-black/10 dark:bg-white/10" />
                          <DropdownMenuItem asChild className="cursor-pointer font-medium text-blue-600 rounded-lg focus:text-blue-600 focus:bg-blue-50 dark:focus:bg-blue-900/30">
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