'use client'

import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { api } from '@/lib/api'
import { Sheet } from '@/types/sheet'
import { useEffect, useRef, useState } from 'react'
import { translateSheetType, formatDate, formatDocument, formatCurrency } from '@/lib/formatters'
import { CreateSheetModal } from '@/components/CreateSheetModal'
import { Pagination } from '@/components/Pagination'
import { MoreHorizontal, Eye, Scissors, Search, SlidersHorizontal, X } from 'lucide-react'
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
import { useSearchParams, useRouter } from 'next/navigation'

interface Material {
  id: string
  name: string
  slug: string
}

interface SheetsMeta {
  page: number
  perPage: number
  total: number
  totalPages: number
}

// ─── URL helpers ────────────────────────────────────────────────────────────

function parseCSV(value: string | null): string[] {
  if (!value) return []
  return value.split(',').map((s) => s.trim()).filter(Boolean)
}

function toCSV(values: string[]): string {
  return values.join(',')
}

// ─── Filter chip ────────────────────────────────────────────────────────────

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="hover:text-red-500 transition-colors hover:cursor-pointer"
        aria-label={`Remover filtro: ${label}`}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  )
}

// ─── Multi-select list ───────────────────────────────────────────────────────

function MultiSelectList({
  options,
  selected,
  onToggle,
  placeholder = 'Selecionar...',
}: {
  options: string[]
  selected: string[]
  onToggle: (value: string) => void
  placeholder?: string
}) {
  const [q, setQ] = useState('')
  const filtered = options.filter((o) => o.toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="space-y-1.5">
      <input
        className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent px-2.5 py-1.5 text-xs outline-none placeholder:text-zinc-400"
        placeholder={placeholder}
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className="max-h-48 overflow-y-auto space-y-0.5 pr-1">
        {filtered.length === 0 && (
          <p className="text-xs text-zinc-500 text-center py-2">Nenhum resultado</p>
        )}
        {filtered.map((opt) => {
          const checked = selected.includes(opt)
          return (
            <label
              key={opt}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 text-xs text-zinc-800 dark:text-zinc-200"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(opt)}
                className="rounded"
              />
              <span className="truncate">{opt}</span>
            </label>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

export function SheetsTab() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()

  const canCreate = user?.role === 'ADMIN' || user?.permissions?.['sheets']?.write
  const canCut = user?.role === 'ADMIN' || user?.permissions?.['cut-orders']?.write

  // Read URL state
  const rawSearch = searchParams.get('search') ?? ''
  const rawMaterials = parseCSV(searchParams.get('materials'))
  const rawThicknesses = parseCSV(searchParams.get('thicknesses'))
  const rawType = (searchParams.get('type') ?? '') as 'STANDARD' | 'SCRAP' | ''
  const rawPage = parseInt(searchParams.get('page') ?? '1', 10)
  const perPage = parseInt(searchParams.get('perPage') ?? '20', 10)

  // Local debounce for search input
  const [searchInput, setSearchInput] = useState(rawSearch)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sheets data
  const [sheets, setSheets] = useState<Sheet[]>([])
  const [meta, setMeta] = useState<SheetsMeta>({ page: 1, perPage: 20, total: 0, totalPages: 1 })
  const [isLoading, setIsLoading] = useState(true)

  // Filter options
  const [materialOptions, setMaterialOptions] = useState<string[]>([])
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Pending filter state inside popover (apply on "Aplicar")
  const [pendingMaterials, setPendingMaterials] = useState<string[]>(rawMaterials)
  const [pendingThicknesses, setPendingThicknesses] = useState<string[]>(rawThicknesses)
  const [pendingType, setPendingType] = useState<'STANDARD' | 'SCRAP' | ''>(rawType)

  // Common thickness options
  const thicknessOptions = ['0.5', '0.8', '1.0', '1.2', '1.5', '2.0', '2.5', '3.0', '4.0', '4.75', '5.0', '6.0', '8.0', '10.0', '12.0']

  // ── Fetch materials for filter options ─────────────────────────────────────
  useEffect(() => {
    api.get('/materials').then((res) => {
      const names: string[] = (res.data.materials as Material[]).map((m) => m.name)
      setMaterialOptions(names)
    }).catch(() => { /* silent */ })
  }, [])

  // ── Fetch sheets — keyed on the raw URL param string so arrays don't cause
  //    infinite loops from new references on every render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const searchParamsStr = searchParams.toString()

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    const params = new URLSearchParams()
    params.set('page', String(rawPage))
    params.set('perPage', String(perPage))
    if (rawSearch) params.set('search', rawSearch)
    const mats = parseCSV(searchParams.get('materials'))
    const thicks = parseCSV(searchParams.get('thicknesses'))
    if (mats.length > 0) params.set('materials', toCSV(mats))
    if (thicks.length > 0) params.set('thicknesses', toCSV(thicks))
    if (rawType) params.set('type', rawType)
    params.set('sortBy', 'updatedAt')
    params.set('sortOrder', 'desc')

    api.get(`/sheets?${params.toString()}`)
      .then((res) => {
        if (cancelled) return
        setSheets(res.data.sheets ?? [])
        if (res.data.meta) {
          setMeta(res.data.meta)
        }
      })
      .catch(() => { if (!cancelled) setSheets([]) })
      .finally(() => { if (!cancelled) setIsLoading(false) })

    return () => { cancelled = true }
    // searchParamsStr is a stable primitive that encodes all URL state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParamsStr])

  // ── Keep searchInput in sync when URL changes externally ───────────────────
  useEffect(() => {
    setSearchInput(rawSearch)
  }, [rawSearch])

  // ── URL mutation helpers ────────────────────────────────────────────────────
  function pushURL(updates: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === '') {
        next.delete(k)
      } else {
        next.set(k, v)
      }
    }
    // Reset to page 1 on filter change unless page is explicitly set
    if (!('page' in updates)) {
      next.set('page', '1')
    }
    router.replace(`/stock?${next.toString()}`, { scroll: false })
  }

  // ── Search debounce ─────────────────────────────────────────────────────────
  function handleSearchChange(value: string) {
    setSearchInput(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      pushURL({ search: value || null })
    }, 300)
  }

  // ── Apply filters from popover ──────────────────────────────────────────────
  function applyFilters() {
    pushURL({
      materials: pendingMaterials.length > 0 ? toCSV(pendingMaterials) : null,
      thicknesses: pendingThicknesses.length > 0 ? toCSV(pendingThicknesses) : null,
      type: pendingType || null,
    })
    setFiltersOpen(false)
  }

  function openFilters() {
    // Sync pending state with current URL state
    setPendingMaterials(rawMaterials)
    setPendingThicknesses(rawThicknesses)
    setPendingType(rawType)
    setFiltersOpen(true)
  }

  // ── Remove individual active filters ───────────────────────────────────────
  function removeMaterial(name: string) {
    pushURL({ materials: toCSV(rawMaterials.filter((m) => m !== name)) || null })
  }

  function removeThickness(t: string) {
    pushURL({ thicknesses: toCSV(rawThicknesses.filter((x) => x !== t)) || null })
  }

  function clearAllFilters() {
    pushURL({ search: null, materials: null, thicknesses: null, type: null, page: '1' })
    setSearchInput('')
  }

  // ── Active filter count ─────────────────────────────────────────────────────
  const activeFilterCount = rawMaterials.length + rawThicknesses.length + (rawType ? 1 : 0)
  const hasActiveFilters = activeFilterCount > 0 || rawSearch.length > 0

  return (
    <>
      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div className='flex flex-col gap-3 shrink-0'>
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-3'>
          <div className='flex items-center gap-3 w-full md:w-auto'>
            {/* Type quick-filter */}
            <div className='flex p-1 bg-black/5 dark:bg-white/10 backdrop-blur-md rounded-xl overflow-hidden'>
              {(['', 'STANDARD', 'SCRAP'] as const).map((t) => {
                const label = t === '' ? 'Tudo' : t === 'STANDARD' ? 'Chapas' : 'Retalhos'
                return (
                  <button
                    key={t}
                    onClick={() => pushURL({ type: t || null })}
                    className={`px-5 py-1.5 text-sm font-medium rounded-lg transition-all duration-300 hover:cursor-pointer ${rawType === t ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>

            {canCreate && <CreateSheetModal onSuccess={() => pushURL({ page: '1' })} />}
          </div>

          <div className='flex items-center gap-2 w-full md:w-auto'>
            {/* Search */}
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Buscar por SKU, material, espessura ou dimensões…"
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9 bg-white/50 dark:bg-black/20"
              />
            </div>

            {/* Filters popover */}
            <Popover open={filtersOpen} onOpenChange={(open) => { if (open) openFilters(); else setFiltersOpen(false) }}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="relative gap-2 hover:cursor-pointer">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filtros
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-[10px] text-white flex items-center justify-center font-bold">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 space-y-4 p-4">
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Filtros</p>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Material</p>
                  <MultiSelectList
                    options={materialOptions}
                    selected={pendingMaterials}
                    onToggle={(v) => setPendingMaterials((prev) => prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v])}
                    placeholder="Buscar material…"
                  />
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Espessura (mm)</p>
                  <MultiSelectList
                    options={thicknessOptions}
                    selected={pendingThicknesses}
                    onToggle={(v) => setPendingThicknesses((prev) => prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v])}
                    placeholder="Filtrar espessura…"
                  />
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Tipo</p>
                  <div className="flex gap-2">
                    {(['', 'STANDARD', 'SCRAP'] as const).map((t) => {
                      const label = t === '' ? 'Todos' : t === 'STANDARD' ? 'Original' : 'Retalho'
                      return (
                        <button
                          key={t}
                          onClick={() => setPendingType(t)}
                          className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors hover:cursor-pointer ${pendingType === t ? 'bg-primary text-primary-foreground border-primary' : 'border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5'}`}
                        >
                          {label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 hover:cursor-pointer"
                    onClick={() => { setPendingMaterials([]); setPendingThicknesses([]); setPendingType('') }}
                  >
                    Limpar
                  </Button>
                  <Button size="sm" className="flex-1 hover:cursor-pointer" onClick={applyFilters}>
                    Aplicar
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* ── Active filter chips ──────────────────────────────────────── */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            {rawSearch && (
              <FilterChip label={`Busca: ${rawSearch}`} onRemove={() => { setSearchInput(''); pushURL({ search: null }) }} />
            )}
            {rawMaterials.map((m) => (
              <FilterChip key={m} label={m} onRemove={() => removeMaterial(m)} />
            ))}
            {rawThicknesses.map((t) => (
              <FilterChip key={t} label={`${t} mm`} onRemove={() => removeThickness(t)} />
            ))}
            {rawType && (
              <FilterChip
                label={rawType === 'STANDARD' ? 'Tipo: Original' : 'Tipo: Retalho'}
                onRemove={() => pushURL({ type: null })}
              />
            )}
            <button
              onClick={clearAllFilters}
              className="text-xs text-zinc-500 hover:text-red-500 transition-colors underline underline-offset-2 hover:cursor-pointer"
            >
              Limpar filtros
            </button>
          </div>
        )}

        {/* ── Result counter — always rendered to avoid layout shift ───── */}
        <p className="text-xs text-zinc-500 dark:text-zinc-400 min-h-[1rem]">
          {!isLoading && (
            <>{meta.total} {meta.total === 1 ? 'resultado' : 'resultados'}</>
          )}
        </p>
      </div>

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <div className='glass-card overflow-hidden flex-1 min-h-0 flex flex-col p-1'>
        <div className="overflow-auto hide-v-scroll flex-1 relative rounded-2xl">
          <Table className="min-w-[960px]">
            <TableHeader className="sticky top-0 z-10 bg-zinc-50/80 backdrop-blur-md dark:bg-zinc-900/80">
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Espessura</TableHead>
                <TableHead>Dimensões</TableHead>
                <TableHead className="text-zinc-400 font-normal">SKU</TableHead>
                <TableHead>Cliente / Documento</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Entrada</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Preço Unit.</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} className='h-24 text-center text-muted-foreground'>
                    Carregando chapas…
                  </TableCell>
                </TableRow>
              ) : sheets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className='h-24 text-center text-muted-foreground'>
                    Nenhuma chapa encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                sheets.map((sheet) => (
                  <TableRow key={sheet.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b border-white/20 dark:border-white/5">
                    {/* Material */}
                    <TableCell className='font-medium text-zinc-900 dark:text-zinc-100'>
                      {sheet.material?.name ?? '—'}
                    </TableCell>

                    {/* Espessura */}
                    <TableCell className='text-zinc-700 dark:text-zinc-300 whitespace-nowrap'>
                      {sheet.thickness != null ? `${sheet.thickness} mm` : '—'}
                    </TableCell>

                    {/* Dimensões */}
                    <TableCell className='text-zinc-700 dark:text-zinc-300 whitespace-nowrap'>
                      {sheet.width != null && sheet.height != null
                        ? `${sheet.width} × ${sheet.height}`
                        : '—'}
                    </TableCell>

                    {/* SKU */}
                    <TableCell className='font-mono text-xs text-zinc-400 dark:text-zinc-500' title={sheet.sku}>
                      {sheet.sku.split('-C:')[0]}
                    </TableCell>

                    {/* Cliente */}
                    <TableCell>
                      {sheet.client ? (
                        <div className='flex flex-col'>
                          <span className='font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-[180px]'>{sheet.client.name}</span>
                          <span className='text-xs text-zinc-500 dark:text-zinc-400'>{formatDocument(sheet.client.document)}</span>
                        </div>
                      ) : (
                        <span className='text-zinc-500 italic text-sm'>Estoque Próprio</span>
                      )}
                    </TableCell>

                    {/* Tipo */}
                    <TableCell>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm ${sheet.type === 'SCRAP'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                        }`}>
                        {translateSheetType(sheet.type)}
                      </span>
                    </TableCell>

                    {/* Entrada */}
                    <TableCell className='text-zinc-500 dark:text-zinc-400 whitespace-nowrap'>
                      {formatDate(sheet.createdAt)}
                    </TableCell>

                    {/* Quantidade */}
                    <TableCell className='font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap'>
                      {sheet.quantity} un
                    </TableCell>

                    {/* Preço */}
                    <TableCell className='text-zinc-700 dark:text-zinc-300 whitespace-nowrap'>
                      {formatCurrency(sheet.price)}
                    </TableCell>

                    {/* Ações */}
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
                            <Link href={`/stock/${sheet.id}`}>
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
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ── Pagination ──────────────────────────────────────────────────── */}
      {!isLoading && meta.totalPages > 0 && (
        <Pagination
          currentPage={meta.page}
          totalPages={meta.totalPages}
          hasMore={meta.page < meta.totalPages}
          onPageChange={(p) => pushURL({ page: String(p) })}
        />
      )}
    </>
  )
}
