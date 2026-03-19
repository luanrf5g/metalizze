'use client'

import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api } from '@/lib/api'
import { Sheet } from '@/types/sheet'
import { useEffect, useState } from 'react'
import { translateSheetType, formatDate, formatDocument, formatCurrency } from '@/lib/formatters'
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
import { useAuth } from '@/components/AuthProvider'

import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export default function SheetsPage() {
  const [sheets, setSheets] = useState<Sheet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'STANDARD' | 'SCRAP'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchBaseSheets, setSearchBaseSheets] = useState<Sheet[] | null>(null)
  const [searchFilterKey, setSearchFilterKey] = useState<'ALL' | 'STANDARD' | 'SCRAP' | null>(null)
  const [isSearchLoading, setIsSearchLoading] = useState(false)

  const { user } = useAuth()
  const canCreate = user?.role === 'ADMIN' || user?.permissions?.['sheets']?.write
  const canCut = user?.role === 'ADMIN' || user?.permissions?.['cut-orders']?.write

  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalPages, setTotalPages] = useState<number | undefined>(undefined)

  async function fetchSheets(currentPage: number = page) {
    setIsLoading(true)
    try {
      let route = `/sheets?page=${currentPage}`

      if (activeFilter === 'STANDARD') route += '&type=STANDARD'
      else if (activeFilter === 'SCRAP') route += '&type=SCRAP'

      const response = await api.get(route)

      const newSheets = response.data.sheets || []
      setSheets(newSheets)

      const meta = response.data.meta
      if (meta && typeof meta.totalPages === 'number') {
        setTotalPages(meta.totalPages)
        setHasMore(currentPage < meta.totalPages)
      } else {
        // Fallback: assume 15 itens por página
        setHasMore(newSheets.length === 15)
        setTotalPages(undefined)
      }
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
    // Se o filtro mudar, invalidamos a base de busca para recarregar com o novo filtro caso o usuário esteja pesquisando
    setSearchBaseSheets(null)
    setSearchFilterKey(null)
  }, [activeFilter])

  useEffect(() => {
    fetchSheets(page)
  }, [page])

  // Carrega a base completa de chapas para a busca quando houver texto de pesquisa
  useEffect(() => {
    const hasQuery = searchQuery.trim().length > 0

    if (!hasQuery) {
      setSearchBaseSheets(null)
      setSearchFilterKey(null)
      return
    }

    // Já temos a base carregada para o filtro atual
    if (searchBaseSheets && searchFilterKey === activeFilter) {
      return
    }

    let ignore = false

    async function loadAllSheetsForSearch() {
      setIsSearchLoading(true)
      try {
        const aggregatedSheets: Sheet[] = []
        let currentPage = 1
        let totalPages: number | null = null

        while (totalPages === null || currentPage <= totalPages) {
          // Para a página atual já carregada na listagem principal,
          // reutilizamos os dados em memória e evitamos uma segunda requisição.
          if (currentPage === page && sheets.length > 0 && !isLoading) {
            aggregatedSheets.push(...sheets)
          } else {
            let pageRoute = `/sheets?page=${currentPage}`

            if (activeFilter === 'STANDARD') pageRoute += '&type=STANDARD'
            else if (activeFilter === 'SCRAP') pageRoute += '&type=SCRAP'

            const pageRes = await api.get(pageRoute)
            const pageSheets: Sheet[] = pageRes.data.sheets || []
            aggregatedSheets.push(...pageSheets)

            const meta = pageRes.data.meta
            if (meta && typeof meta.totalPages === 'number') {
              totalPages = meta.totalPages
            } else if (pageSheets.length < 15) {
              // heurística de parada se meta não vier
              break
            }
          }

          currentPage += 1
        }

        if (ignore) return

        setSearchBaseSheets(aggregatedSheets)
        setSearchFilterKey(activeFilter)
      } catch (error) {
        console.error('Erro ao buscar chapas para pesquisa: ', error)
        if (!ignore) {
          // Marca como "carregado" para o filtro atual mesmo em caso de erro,
          // para evitar laços infinitos de novas requisições.
          setSearchBaseSheets([])
          setSearchFilterKey(activeFilter)
        }
      } finally {
        if (!ignore) {
          setIsSearchLoading(false)
        }
      }
    }

    loadAllSheetsForSearch()

    return () => {
      ignore = true
    }
  }, [searchQuery, activeFilter, searchBaseSheets, searchFilterKey])

  return (
    <div className='p-6 md:p-10 w-full h-full mx-auto flex flex-col space-y-6 animate-in fade-in zoom-in-95 duration-700'>
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between shrink-0 gap-4'>
        <div>
          <h1 className='text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400 pb-1'>Estoque de Chapas</h1>
          <p className='text-zinc-500 dark:text-zinc-400 text-sm font-medium mt-1'>Gerencie as chapas disponíveis no estoque.</p>
        </div>
        {canCreate && <CreateSheetModal onSuccess={() => fetchSheets(page)} />}
      </div>

      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0'>
        {/* Apple Style Segmented Control */}
        <div className='flex p-1 bg-black/5 dark:bg-white/10 backdrop-blur-md rounded-xl w-full md:w-auto overflow-hidden'>
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`flex-1 md:flex-none px-6 py-2 text-sm font-medium rounded-lg transition-all duration-300 hover:cursor-pointer ${activeFilter === 'ALL' ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
          >
            Tudo
          </button>
          <button
            onClick={() => setActiveFilter('STANDARD')}
            className={`flex-1 md:flex-none px-6 py-2 text-sm font-medium rounded-lg transition-all duration-300 hover:cursor-pointer ${activeFilter === 'STANDARD' ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
          >
            Chapas
          </button>
          <button
            onClick={() => setActiveFilter('SCRAP')}
            className={`flex-1 md:flex-none px-6 py-2 text-sm font-medium rounded-lg transition-all duration-300 hover:cursor-pointer ${activeFilter === 'SCRAP' ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
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
                <TableHead className="w-[70px]">#</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Cliente / Documento</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Entrada</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Preço Unit.</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(() => {
                const query = searchQuery.trim().toLowerCase()
                const isSearching = query.length > 0
                const isTableLoading = isSearching ? (isSearchLoading || (!searchBaseSheets && query.length > 0)) : isLoading

                const baseList = isSearching && searchBaseSheets ? searchBaseSheets : sheets

                const filteredSheets = baseList.filter((s) => {
                  if (!isSearching) return true

                  const matchesSku = s.sku.toLowerCase().includes(query)
                  const clientName = s.client?.name ? s.client.name.toLowerCase() : ''
                  const matchesClient = clientName.includes(query)

                  return matchesSku || matchesClient
                })

                if (isTableLoading) {
                  return (
                    <TableRow>
                      <TableCell colSpan={8} className='h-24 text-center text-muted-foreground'>
                        Carregando estoque...
                      </TableCell>
                    </TableRow>
                  )
                }

                if (filteredSheets.length === 0) {
                  return (
                    <TableRow>
                      <TableCell colSpan={8} className='h-24 text-center text-muted-foreground'>
                        Nenhuma chapa encontrada.
                      </TableCell>
                    </TableRow>
                  )
                }

                const baseIndex = isSearching ? 0 : (page - 1) * 15

                return filteredSheets.map((sheet, index) => (
                  <TableRow key={sheet.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b border-white/20 dark:border-white/5">
                    <TableCell className="font-mono text-xs text-zinc-400 dark:text-zinc-500">#{(baseIndex + index + 1).toString().padStart(3, '0')}</TableCell>
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
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm ${sheet.type === 'SCRAP'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                        }`}>
                        {translateSheetType(sheet.type)}
                      </span>
                    </TableCell>
                    <TableCell className='text-zinc-500 dark:text-zinc-400 whitespace-nowrap'>
                      {formatDate(sheet.createdAt)}
                    </TableCell>
                    <TableCell className='font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap'>{sheet.quantity} un</TableCell>
                    <TableCell className='text-zinc-700 dark:text-zinc-300 whitespace-nowrap'>{formatCurrency(sheet.price)}</TableCell>
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
                            <Link href={`/sheets/${sheet.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver detalhes
                            </Link>
                          </DropdownMenuItem>
                          {canCut && (
                            <>
                              <DropdownMenuSeparator className="bg-black/10 dark:bg-white/10" />
                              <DropdownMenuItem asChild className="cursor-pointer font-medium text-zinc-900 rounded-lg focus:text-zinc-900 focus:bg-zinc-100 dark:focus:bg-zinc-800">
                                <Link href={`/cut-orders?sheetId=${sheet.id}`}>
                                  <Scissors className="mr-2 h-4 w-4" />
                                  Cortar chapa
                                </Link>
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              })()}
            </TableBody>
          </Table>
        </div>
      </div>

      {searchQuery.trim().length === 0 && !isLoading && (sheets.length > 0 || page > 1) && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          hasMore={hasMore}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}