'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api } from '@/lib/api'
import { Sheet } from '@/types/sheet'
import { useEffect, useState } from 'react'
import { formatDate, formatDocument } from '@/lib/formatters'
import { Pagination } from '@/components/Pagination'
import { BoxSelect } from 'lucide-react'

export default function ScrapsPage() {
  const [scraps, setScraps] = useState<Sheet[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  async function fetchScraps(currentPage: number = page) {
    setIsLoading(true)
    try {
      // Força a buscar apenas retalhos
      const response = await api.get(`/sheets?type=SCRAP&page=${currentPage}`)

      const newScraps = response.data.sheets || []
      setScraps(newScraps)
      setHasMore(newScraps.length === 20)
    } catch (error) {
      console.error('Erro ao buscar retalhos: ', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchScraps(page)
  }, [page])

  return (
    <div className='p-6 md:p-10 w-full h-full mx-auto flex flex-col animate-in fade-in zoom-in-95 duration-700'>
      <div className='flex items-center gap-4 shrink-0 mb-6'>
        <div>
          <h1 className='text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400 pb-1'>Retalhos</h1>
          <p className='text-zinc-500 dark:text-zinc-400 text-sm font-medium mt-1'>Visualize e gerencie os retalhos gerados pelas ordens de corte.</p>
        </div>
      </div>

      <div className='glass-card overflow-hidden flex-1 min-h-0 flex flex-col p-1'>
        <div className="overflow-auto hide-v-scroll flex-1 relative rounded-2xl">
          <Table className="min-w-[800px]">
            <TableHeader className="sticky top-0 z-10 bg-zinc-50/80 backdrop-blur-md dark:bg-zinc-900/80">
              <TableRow>
                <TableHead>SKU do Retalho</TableHead>
                <TableHead>Cliente / Documento</TableHead>
                <TableHead>Data de Geração</TableHead>
                <TableHead>Quantidade (un)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className='h-24 text-center text-muted-foreground'>
                    Buscando retalhos...
                  </TableCell>
                </TableRow>
              ) : scraps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className='h-24 text-center text-muted-foreground'>
                    Nenhum retalho encontrado nesta página.
                  </TableCell>
                </TableRow>
              ) : (
                scraps.map((scrap) => (
                  <TableRow key={scrap.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b border-white/20 dark:border-white/5">
                    <TableCell className='font-semibold text-zinc-900 dark:text-zinc-100' title={scrap.sku}>
                      {scrap.sku}
                    </TableCell>
                    <TableCell>
                      {scrap.client ? (
                        <div className='flex flex-col'>
                          <span className='font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-[200px]'>{scrap.client.name}</span>
                          <span className='text-sm text-zinc-500 dark:text-zinc-400'>{formatDocument(scrap.client.document)}</span>
                        </div>
                      ) : (
                        <span className='text-zinc-500 italic text-sm'>Estoque Próprio</span>
                      )}
                    </TableCell>
                    <TableCell className='text-zinc-500 dark:text-zinc-400 whitespace-nowrap'>
                      {formatDate(scrap.createdAt)}
                    </TableCell>
                    <TableCell className='font-bold text-amber-600 dark:text-amber-400 whitespace-nowrap'>{scrap.quantity}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {!isLoading && (scraps.length > 0 || page > 1) && (
        <div className="mt-4 shrink-0">
          <Pagination
            currentPage={page}
            hasMore={hasMore}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  )
}