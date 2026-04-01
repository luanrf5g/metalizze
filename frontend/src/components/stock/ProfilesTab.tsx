'use client'

import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api } from '@/lib/api'
import { Profile, ProfileType } from '@/types/profile'
import { useEffect, useState } from 'react'
import { translateProfileType, formatDate, formatDocument, formatCurrency } from '@/lib/formatters'
import { CreateProfileModal } from '@/components/CreateProfileModal'
import { Pagination } from '@/components/Pagination'
import { MoreHorizontal, Eye, Search } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { Input } from '@/components/ui/input'

const PROFILE_TYPE_FILTERS: { label: string; value: ProfileType | 'ALL' }[] = [
  { label: 'Tudo', value: 'ALL' },
  { label: 'Quadrado', value: 'SQUARE' },
  { label: 'Retangular', value: 'RECTANGULAR' },
  { label: 'Redondo', value: 'ROUND' },
  { label: 'Oblongo', value: 'OBLONG' },
  { label: 'Cantoneira', value: 'ANGLE' },
  { label: 'Perfil U', value: 'U_CHANNEL' },
]

export function ProfilesTab() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<ProfileType | 'ALL'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchBaseProfiles, setSearchBaseProfiles] = useState<Profile[] | null>(null)
  const [searchFilterKey, setSearchFilterKey] = useState<ProfileType | 'ALL' | null>(null)
  const [isSearchLoading, setIsSearchLoading] = useState(false)

  const { user } = useAuth()
  const canCreate = user?.role === 'ADMIN' || user?.permissions?.['sheets']?.write

  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalPages, setTotalPages] = useState<number | undefined>(undefined)

  async function fetchProfiles(currentPage: number = page) {
    setIsLoading(true)
    try {
      let route = `/profiles?page=${currentPage}`
      if (activeFilter !== 'ALL') route += `&profileType=${activeFilter}`

      const response = await api.get(route)

      const newProfiles = response.data.profiles || []
      setProfiles(newProfiles)

      const meta = response.data.meta
      if (meta && typeof meta.totalPages === 'number') {
        setTotalPages(meta.totalPages)
        setHasMore(currentPage < meta.totalPages)
      } else {
        setHasMore(newProfiles.length === 15)
        setTotalPages(undefined)
      }
    } catch (error) {
      console.error('Erro ao buscar perfis: ', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
    fetchProfiles(1)
    setSearchBaseProfiles(null)
    setSearchFilterKey(null)
  }, [activeFilter])

  useEffect(() => {
    fetchProfiles(page)
  }, [page])

  useEffect(() => {
    const hasQuery = searchQuery.trim().length > 0

    if (!hasQuery) {
      setSearchBaseProfiles(null)
      setSearchFilterKey(null)
      return
    }

    if (searchBaseProfiles && searchFilterKey === activeFilter) {
      return
    }

    let ignore = false

    async function loadAllProfilesForSearch() {
      setIsSearchLoading(true)
      try {
        let route = `/profiles/all`
        const params: string[] = []
        if (activeFilter !== 'ALL') params.push(`profileType=${activeFilter}`)
        if (params.length) route += `?${params.join('&')}`

        const res = await api.get(route)
        const allProfiles: Profile[] = res.data.profiles || []

        if (ignore) return

        setSearchBaseProfiles(allProfiles)
        setSearchFilterKey(activeFilter)
      } catch (error) {
        console.error('Erro ao buscar perfis para pesquisa: ', error)
        if (!ignore) {
          setSearchBaseProfiles([])
          setSearchFilterKey(activeFilter)
        }
      } finally {
        if (!ignore) setIsSearchLoading(false)
      }
    }

    loadAllProfilesForSearch()
    return () => { ignore = true }
  }, [searchQuery, activeFilter, searchBaseProfiles, searchFilterKey])

  function formatDimensions(p: Profile) {
    const equalDimTypes: ProfileType[] = ['SQUARE', 'ROUND', 'ANGLE']
    const dim = equalDimTypes.includes(p.profileType)
      ? `${p.width}mm`
      : `${p.width}×${p.height}mm`
    return `${dim} × ${p.length}mm`
  }

  return (
    <>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0'>
        <div className='flex items-center gap-3 w-full md:w-auto flex-wrap'>
          <div className='flex p-1 bg-black/5 dark:bg-white/10 backdrop-blur-md rounded-xl overflow-hidden flex-wrap'>
            {PROFILE_TYPE_FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-300 hover:cursor-pointer whitespace-nowrap ${activeFilter === filter.value ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          {canCreate && <CreateProfileModal onSuccess={() => fetchProfiles(page)} />}
        </div>

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
          <Table className="min-w-[900px]">
            <TableHeader className="sticky top-0 z-10 bg-zinc-50/80 backdrop-blur-md dark:bg-zinc-900/80">
              <TableRow>
                <TableHead className="w-[70px]">#</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Dimensões</TableHead>
                <TableHead>Cliente / Documento</TableHead>
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
                const isTableLoading = isSearching ? (isSearchLoading || (!searchBaseProfiles && query.length > 0)) : isLoading

                const baseList = isSearching && searchBaseProfiles ? searchBaseProfiles : profiles

                const filtered = baseList.filter((p) => {
                  if (!isSearching) return true
                  const matchesSku = p.sku.toLowerCase().includes(query)
                  const clientName = p.client?.name ? p.client.name.toLowerCase() : ''
                  return matchesSku || clientName.includes(query)
                })

                if (isTableLoading) {
                  return (
                    <TableRow>
                      <TableCell colSpan={9} className='h-24 text-center text-muted-foreground'>
                        Carregando perfis...
                      </TableCell>
                    </TableRow>
                  )
                }

                if (filtered.length === 0) {
                  return (
                    <TableRow>
                      <TableCell colSpan={9} className='h-24 text-center text-muted-foreground'>
                        Nenhum perfil encontrado.
                      </TableCell>
                    </TableRow>
                  )
                }

                const baseIndex = isSearching ? 0 : (page - 1) * 15

                return filtered.map((profile, index) => (
                  <TableRow key={profile.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b border-white/20 dark:border-white/5">
                    <TableCell className="font-mono text-xs text-zinc-400 dark:text-zinc-500">#{(baseIndex + index + 1).toString().padStart(3, '0')}</TableCell>
                    <TableCell className='font-medium text-zinc-900 dark:text-zinc-100' title={profile.sku}>
                      {profile.sku.split('-C:')[0]}
                    </TableCell>
                    <TableCell>
                      <span className='px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap shadow-sm bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300'>
                        {translateProfileType(profile.profileType)}
                      </span>
                    </TableCell>
                    <TableCell className='text-zinc-700 dark:text-zinc-300 whitespace-nowrap text-sm'>
                      {formatDimensions(profile)}
                      <span className="text-zinc-400 ml-1">· {profile.thickness}mm</span>
                    </TableCell>
                    <TableCell>
                      {profile.client ? (
                        <div className='flex flex-col'>
                          <span className='font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-[200px]'>{profile.client.name}</span>
                          <span className='text-sm text-zinc-500 dark:text-zinc-400'>{formatDocument(profile.client.document)}</span>
                        </div>
                      ) : (
                        <span className='text-zinc-500 italic text-sm'>Estoque Próprio</span>
                      )}
                    </TableCell>
                    <TableCell className='text-zinc-500 dark:text-zinc-400 whitespace-nowrap'>
                      {formatDate(profile.createdAt)}
                    </TableCell>
                    <TableCell className='font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap'>{profile.quantity} un</TableCell>
                    <TableCell className='text-zinc-700 dark:text-zinc-300 whitespace-nowrap'>{formatCurrency(profile.price)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass-panel border-white/20 rounded-xl">
                          <DropdownMenuLabel className="font-semibold">Ações do Perfil</DropdownMenuLabel>
                          <DropdownMenuItem asChild className="cursor-pointer rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
                            <Link href={`/stock/profiles/${profile.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver detalhes
                            </Link>
                          </DropdownMenuItem>
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

      {searchQuery.trim().length === 0 && !isLoading && (profiles.length > 0 || page > 1) && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          hasMore={hasMore}
          onPageChange={setPage}
        />
      )}
    </>
  )
}
