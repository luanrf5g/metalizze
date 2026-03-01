'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api } from '@/lib/api'
import { Sheet } from '@/types/sheet'
import { useEffect, useState } from 'react'
import { formatDate } from '@/lib/formatters'

export default function ScrapsPage() {
  const [scraps, setScraps] = useState<Sheet[]>([])
  const [isLoading, setIsLoading] = useState(true)

  async function fetchScraps() {
    setIsLoading(true)
    try {
      const response = await api.get('/sheets?type=SCRAP')
      setScraps(response.data.sheets)
    } catch (error) {
      console.error('Erro ao buscar retalhos: ', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchScraps()
  }, [])

  return (
    <div className='p-8 max-x-6xl mx-auto space-y-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Retalhos</h1>
        <p className='text-muted-foreground text-sm mt-1'>
          Chapas de reaproveitamento geradas a partir de cortes.
        </p>
      </div>

      <div className='border rounded-md'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Material</TableHead>
              <TableHead>Dimensões (L × A × E)</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Entrada</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className='h-24 text-center text-muted-foreground'>
                  Carregando retalhos...
                </TableCell>
              </TableRow>
            ) : scraps.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className='h-24 text-center text-muted-foreground'>
                  Nenhum retalho disponível no estoque.
                </TableCell>
              </TableRow>
            ) : (
              scraps.map((scrap) => (
                <TableRow key={scrap.id}>
                  <TableCell className='font-medium'>{scrap.sku}</TableCell>
                  <TableCell>{scrap.materialId}</TableCell>
                  <TableCell className='text-zinc-500'>
                    {scrap.width} × {scrap.height} × {scrap.thickness} mm
                  </TableCell>
                  <TableCell>
                    {scrap.client ? (
                      <span className='text-zinc-700'>{scrap.client.name}</span>
                    ) : (
                      <span className='text-zinc-400 italic text-sm'>Estoque Próprio</span>
                    )}
                  </TableCell>
                  <TableCell className='font-bold'>{scrap.quantity}</TableCell>
                  <TableCell className='text-muted-foreground'>{formatDate(scrap.createdAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}