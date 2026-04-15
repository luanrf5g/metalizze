'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { AlertCircleIcon, ArrowDownIcon, ArrowUpIcon, CalendarIcon, CheckIcon, ChevronsUpDownIcon, ChevronDownIcon, DownloadIcon, EyeIcon, FilterIcon, Loader2Icon, SearchIcon, XIcon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAuth } from '@/components/AuthProvider'
import { Pagination } from '@/components/Pagination'
import { QuoteStatusBadge } from '@/components/quotes/QuoteStatusBadge'
import { CreateQuoteModal } from '@/components/quotes/CreateQuoteModal'
import { fetchQuotes, fetchClientOptions, getQuoteById, type ClientOption, type QuotesListResponse } from '@/lib/quotes-api'
import { formatCurrency, formatDate } from '@/lib/formatters'
import type { QuoteDTO, QuoteStatus, QuotesSortBy, QuotesSortOrder, MetaDTO } from '@/types/quote'

const STATUS_OPTIONS: { label: string; value: QuoteStatus }[] = [
  { label: 'Rascunho', value: 'DRAFT' },
  { label: 'Enviado', value: 'SENT' },
  { label: 'Aprovado', value: 'APPROVED' },
  { label: 'Rejeitado', value: 'REJECTED' },
  { label: 'Expirado', value: 'EXPIRED' },
]

const SORT_OPTIONS: { label: string; value: QuotesSortBy }[] = [
  { label: 'Atualizado em', value: 'updatedAt' },
  { label: 'Criado em', value: 'createdAt' },
  { label: 'Total', value: 'totalQuote' },
  { label: 'Código', value: 'code' },
]

const PER_PAGE_OPTIONS = [10, 20, 50]

function SortIcon({ column, currentSortBy, currentSortOrder }: {
  column: QuotesSortBy
  currentSortBy: QuotesSortBy
  currentSortOrder: QuotesSortOrder
}) {
  if (currentSortBy !== column) return <ChevronsUpDownIcon className="size-3.5 opacity-40 ml-1 inline" />
  return currentSortOrder === 'asc'
    ? <ArrowUpIcon className="size-3.5 ml-1 inline" />
    : <ArrowDownIcon className="size-3.5 ml-1 inline" />
}

export default function QuotesPage() {
  const { user } = useAuth()
  const canCreate = user?.role === 'ADMIN' || user?.role === 'OPERATOR'
  const router = useRouter()
  const sp = useSearchParams()

  // ── Derive state from URL ──────────────────────────────────────────
  const page = Math.max(1, Number(sp.get('page') ?? '1'))
  const perPage = [10, 20, 50].includes(Number(sp.get('perPage') ?? '20'))
    ? Number(sp.get('perPage') ?? '20')
    : 20
  const sortBy = (sp.get('sortBy') as QuotesSortBy) || 'updatedAt'
  const sortOrder = (sp.get('sortOrder') as QuotesSortOrder) || 'desc'
  const statusParam = sp.get('status') ?? ''          // CSV
  const clientIdParam = sp.get('clientId') ?? ''
  const fromParam = sp.get('from') ?? ''
  const toParam = sp.get('to') ?? ''
  const myQuotes = sp.get('myQuotes') === '1'

  // search is kept as local state + debounced to URL
  const searchFromUrl = sp.get('search') ?? ''
  const [searchInput, setSearchInput] = useState(searchFromUrl)
  const searchInitialized = useRef(false)
  useEffect(() => {
    // Sync search input from URL only on the first render
    if (!searchInitialized.current) {
      setSearchInput(searchFromUrl)
      searchInitialized.current = true
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Debounce search → URL
  useEffect(() => {
    const timer = setTimeout(() => {
      const current = sp.get('search') ?? ''
      if (searchInput !== current) {
        updateUrl({ search: searchInput || null, page: '1' })
      }
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Data state ────────────────────────────────────────────────────
  const [quotes, setQuotes] = useState<QuoteDTO[]>([])
  const [meta, setMeta] = useState<MetaDTO>({ page: 1, perPage: 20, total: 0, totalPages: 1 })
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [clients, setClients] = useState<ClientOption[]>([])
  const [pdfLoadingId, setPdfLoadingId] = useState<string | null>(null)

  useEffect(() => {
    fetchClientOptions().then(setClients).catch(() => { })
  }, [])

  // ── Fetch when URL changes ────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setHasError(false)

    const params: Parameters<typeof fetchQuotes>[0] = {
      page,
      perPage,
      sortBy,
      sortOrder,
      status: statusParam || null,
      clientId: clientIdParam || null,
      createdById: myQuotes && user?.id ? user.id : null,
      code: searchFromUrl || null,
      from: fromParam || null,
      to: toParam || null,
    }

    fetchQuotes(params)
      .then((data: QuotesListResponse) => {
        if (!cancelled) {
          setQuotes(data.quotes)
          setMeta(data.meta)
        }
      })
      .catch(() => {
        if (!cancelled) {
          toast.error('Erro ao carregar orçamentos.')
          setHasError(true)
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => { cancelled = true }
  }, [sp.toString()]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── URL helpers ───────────────────────────────────────────────────
  function updateUrl(updates: Record<string, string | null>) {
    const params = new URLSearchParams(sp.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    }
    router.push(`/quotes?${params.toString()}`)
  }

  function handlePageChange(newPage: number) {
    updateUrl({ page: String(newPage) })
  }

  function handlePerPageChange(val: string) {
    updateUrl({ perPage: val, page: '1' })
  }

  function handleSortColumn(col: QuotesSortBy) {
    if (sortBy === col) {
      updateUrl({ sortOrder: sortOrder === 'asc' ? 'desc' : 'asc', page: '1' })
    } else {
      updateUrl({ sortBy: col, sortOrder: 'desc', page: '1' })
    }
  }

  function handleStatusToggle(status: QuoteStatus) {
    const current = statusParam ? statusParam.split(',') : []
    const next = current.includes(status)
      ? current.filter((s) => s !== status)
      : [...current, status]
    updateUrl({ status: next.join(',') || null, page: '1' })
  }

  function handleClientChange(val: string) {
    updateUrl({ clientId: val === 'ALL' ? null : val, page: '1' })
  }

  function handleFromChange(val: string) {
    updateUrl({ from: val || null, page: '1' })
  }

  function handleToChange(val: string) {
    updateUrl({ to: val || null, page: '1' })
  }

  function handleToggleMyQuotes() {
    updateUrl({ myQuotes: myQuotes ? null : '1', page: '1' })
  }

  function clearFilters() {
    router.push('/quotes')
    setSearchInput('')
  }

  async function handleDownloadPdf(quote: QuoteDTO) {
    if (pdfLoadingId) return
    setPdfLoadingId(quote.id)
    try {
      const fullQuote = await getQuoteById(quote.id)
      const { buildQuotePdf } = await import('@/lib/quote-pdf')
      const { blob, filename } = buildQuotePdf(fullQuote)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Erro ao gerar o PDF.')
    } finally {
      setPdfLoadingId(null)
    }
  }

  // ── Computed helpers ──────────────────────────────────────────────
  const activeStatuses = statusParam ? statusParam.split(',') : []
  const hasFilters =
    searchFromUrl || statusParam || clientIdParam || fromParam || toParam || myQuotes

  const start = (meta?.total ?? 0) === 0 ? 0 : (page - 1) * perPage + 1
  const end = Math.min(page * perPage, meta?.total ?? 0)

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

      {/* ── Filter bar ── */}
      <div className="flex flex-wrap gap-2 mb-4 shrink-0 items-end">
        {/* Search by code */}
        <div className="relative">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Código…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-8 w-44"
          />
        </div>

        {/* Status multi-select */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 h-9">
              <FilterIcon className="size-3.5" />
              Status
              {activeStatuses.length > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                  {activeStatuses.length}
                </Badge>
              )}
              <ChevronDownIcon className="size-3.5 ml-0.5 opacity-60" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="start">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s.value}
                onClick={() => handleStatusToggle(s.value)}
                className="flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm hover:bg-muted transition-colors"
              >
                <span className={`size-4 rounded border flex items-center justify-center shrink-0 ${activeStatuses.includes(s.value) ? 'bg-primary border-primary' : 'border-muted-foreground/40'}`}>
                  {activeStatuses.includes(s.value) && <CheckIcon className="size-3 text-primary-foreground" />}
                </span>
                {s.label}
              </button>
            ))}
          </PopoverContent>
        </Popover>

        {/* Client select */}
        {clients.length > 0 && (
          <Select value={clientIdParam || 'ALL'} onValueChange={handleClientChange}>
            <SelectTrigger className="w-44 h-9">
              <SelectValue placeholder="Cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os clientes</SelectItem>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* My quotes */}
        <Button
          variant={myQuotes ? 'default' : 'outline'}
          size="sm"
          className="h-9"
          onClick={handleToggleMyQuotes}
        >
          Meus orçamentos
        </Button>

        {/* Date range */}
        <div className="flex items-center gap-1.5">
          <div className="flex flex-col gap-0.5">
            <Label className="text-xs text-muted-foreground">De</Label>
            <Input type="date" value={fromParam} onChange={(e) => handleFromChange(e.target.value)} className="h-8 w-36 text-xs" />
          </div>
          <div className="flex flex-col gap-0.5">
            <Label className="text-xs text-muted-foreground">Até</Label>
            <Input type="date" value={toParam} onChange={(e) => handleToChange(e.target.value)} className="h-8 w-36 text-xs" />
          </div>
        </div>

        {/* Sort */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-1.5">
              {SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? 'Ordenar'}
              {sortOrder === 'asc' ? <ArrowUpIcon className="size-3.5" /> : <ArrowDownIcon className="size-3.5" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {SORT_OPTIONS.map((o) => (
              <DropdownMenuItem key={o.value} onClick={() => handleSortColumn(o.value)}>
                {o.label}
                {sortBy === o.value && (
                  sortOrder === 'asc' ? <ArrowUpIcon className="size-3.5 ml-auto" /> : <ArrowDownIcon className="size-3.5 ml-auto" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear filters */}
        {hasFilters && (
          <Button variant="ghost" size="sm" className="h-9 gap-1 text-muted-foreground" onClick={clearFilters}>
            <XIcon className="size-3.5" />
            Limpar
          </Button>
        )}
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
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => handleSortColumn('code')}
                  >
                    Código <SortIcon column="code" currentSortBy={sortBy} currentSortOrder={sortOrder} />
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-16">Rev.</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Criado por</TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => handleSortColumn('totalQuote')}
                  >
                    Total <SortIcon column="totalQuote" currentSortBy={sortBy} currentSortOrder={sortOrder} />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => handleSortColumn('createdAt')}
                  >
                    Criado em <SortIcon column="createdAt" currentSortBy={sortBy} currentSortOrder={sortOrder} />
                  </TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-12">
                      Nenhum orçamento encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  quotes.map((quote) => (
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
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={pdfLoadingId === quote.id}
                            onClick={() => handleDownloadPdf(quote)}
                            title="Baixar PDF"
                          >
                            {pdfLoadingId === quote.id
                              ? <Loader2Icon className="size-4 animate-spin" />
                              : <DownloadIcon className="size-4" />}
                          </Button>
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/quotes/${quote.id}`}>
                              <EyeIcon className="size-4" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* ── Pagination footer ── */}
      {!isLoading && (meta?.total ?? 0) > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 mt-3 shrink-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{start}–{end} de {meta?.total ?? 0}</span>
            <Select value={String(perPage)} onValueChange={handlePerPageChange}>
              <SelectTrigger className="h-8 w-24 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PER_PAGE_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>{n} / pág.</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Pagination
            currentPage={page}
            totalPages={meta?.totalPages ?? 1}
            hasMore={page < (meta?.totalPages ?? 1)}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  )
}

