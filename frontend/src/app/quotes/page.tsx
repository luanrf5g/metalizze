'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { AlertCircleIcon, EyeIcon, Loader2Icon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/components/AuthProvider'
import { QuoteStatusBadge } from '@/components/quotes/QuoteStatusBadge'
import { CreateQuoteModal } from '@/components/quotes/CreateQuoteModal'
import { fetchQuotes } from '@/lib/quotes-api'
import { formatCurrency, formatDate } from '@/lib/formatters'
import type { QuoteDTO, QuoteStatus } from '@/types/quote'

const STATUS_OPTIONS: { label: string; value: QuoteStatus | 'ALL' }[] = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Rascunho', value: 'DRAFT' },
  { label: 'Enviado', value: 'SENT' },
  { label: 'Aprovado', value: 'APPROVED' },
  { label: 'Rejeitado', value: 'REJECTED' },
  { label: 'Expirado', value: 'EXPIRED' },
]

export default function QuotesPage() {
  const { user } = useAuth()
  const canCreate = user?.role === 'ADMIN' || user?.role === 'OPERATOR'

  const [quotes, setQuotes] = useState<QuoteDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | 'ALL'>('ALL')
  const [search, setSearch] = useState('')

  async function loadQuotes() {
    setIsLoading(true)
    setHasError(false)
    try {
      const data = await fetchQuotes({
        status: statusFilter !== 'ALL' ? statusFilter : null,
      })
      setQuotes(data)
    } catch {
      toast.error('Erro ao carregar orçamentos.')
      setHasError(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadQuotes()
  }, [statusFilter])

  const filtered = search.trim()
    ? quotes.filter((q) =>
        q.code.toLowerCase().includes(search.toLowerCase())
      )
    : quotes

  return (
    <div className="p-6 md:p-10 w-full h-full mx-auto flex flex-col animate-in fade-in zoom-in-95 duration-700">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between shrink-0 mb-6 gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400 pb-1">
            Orçamentos
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mt-1">
            Crie e gerencie orçamentos para seus clientes.
          </p>
        </div>
        {canCreate && <CreateQuoteModal />}
      </div>

      {hasError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>
            Não foi possível carregar os orçamentos. Tente novamente.
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 shrink-0">
        <Input
          placeholder="Buscar por código…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-56"
        />
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as QuoteStatus | 'ALL')}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="glass-card overflow-hidden flex-1 min-h-0 flex flex-col p-1">
        <div className="overflow-auto hide-v-scroll flex-1 relative rounded-2xl">
          {isLoading ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground gap-2">
              <Loader2Icon className="size-5 animate-spin" />
              <span>Carregando…</span>
            </div>
          ) : (
            <Table className="min-w-[700px]">
              <TableHeader className="sticky top-0 z-10 bg-zinc-50/80 backdrop-blur-md dark:bg-zinc-900/80">
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-16">Rev.</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Criado por</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      Nenhum orçamento encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((quote) => (
                    <TableRow key={quote.id} className="group">
                      <TableCell className="font-mono text-sm font-medium">{quote.code}</TableCell>
                      <TableCell>
                        <QuoteStatusBadge status={quote.status} />
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        v{quote.revision}
                      </TableCell>
                      <TableCell className="text-sm">
                        {quote.client?.name ?? <span className="text-muted-foreground italic">Avulso</span>}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {quote.createdBy?.name ?? '—'}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(quote.totalQuote)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(quote.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/quotes/${quote.id}`}>
                            <EyeIcon className="size-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  )
}
