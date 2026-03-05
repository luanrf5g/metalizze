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
    <div className='p-8 w-full h-full mx-auto flex flex-col'>
      <div className='flex items-center gap-3 shrink-0 mb-6'>
        <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
          <BoxSelect className="w-6 h-6" />
        </div>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Retalhos</h1>
          <p className='text-muted-foreground text-sm mt-1'>Visualize e gerencie os retalhos gerados pelas ordens de corte.</p>
        </div>
      </div>

      <div className='border rounded-md overflow-hidden flex-1 min-h-0 flex flex-col'>
        <div className="overflow-auto flex-1 relative">
          <Table className="min-w-[800px]">
            <TableHeader className="sticky top-0 z-10 bg-zinc-50 shadow-sm">
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
              ): (
                scraps.map((scrap) => (
                  <TableRow key={scrap.id}>
                    <TableCell className='font-medium' title={scrap.sku}>
                      {scrap.sku}
                    </TableCell>
                    <TableCell>
                      {scrap.client ? (
                        <div className='flex flex-col'>
                          <span className='font-medium text-zinc-900 truncate max-w-[200px]'>{scrap.client.name}</span>
                          <span className='text-sm text-zinc-500'>{formatDocument(scrap.client.document)}</span>
                        </div>
                      ) : (
                        <span className='text-zinc-500 italic text-sm'>Estoque Próprio</span>
                      )}
                    </TableCell>
                    <TableCell className='text-muted-foreground whitespace-nowrap'>
                      {formatDate(scrap.createdAt)}
                    </TableCell>
                    <TableCell className='font-bold text-amber-600 whitespace-nowrap'>{scrap.quantity}</TableCell>
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