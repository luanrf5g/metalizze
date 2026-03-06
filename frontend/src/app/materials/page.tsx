'use client'

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/formatters";
import { Material } from "@/types/material";
import { AlertCircleIcon, Ellipsis, ListChevronsUpDown, PenIcon, PenLineIcon, Search, Trash2Icon, TrashIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { CreateMaterialModal } from "@/components/CreateMaterialModal";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Link from "next/link";

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  async function fetchMaterials() {
    setIsLoading(true)
    setHasError(false)
    try {
      const response = await api.get('/materials')
      setMaterials(response.data.materials)
    } catch (error) {
      console.error('Erro ao buscar os Materiais: ', error)
      setHasError(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMaterials()
  }, [])

  async function handleModifyMaterial() {}

  return (
    <div className='p-6 md:p-10 w-full h-full mx-auto flex flex-col animate-in fade-in zoom-in-95 duration-700'>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between shrink-0 mb-6 gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400 pb-1">Materiais</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mt-1">Gerencie os tipos de materiais e suas especificações.</p>
        </div>
        <CreateMaterialModal onSuccess={fetchMaterials} />
      </div>

      {hasError && (
        <Alert variant="destructive">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>
            Erro ao tentar buscar a lista de materiais. Tente novamente após alguns momentos.
          </AlertDescription>
        </Alert>
      )}

      <div className="glass-card overflow-hidden flex-1 min-h-0 flex flex-col p-1">
        <div className="overflow-auto hide-v-scroll flex-1 relative rounded-2xl">
          <Table className="min-w-[800px]">
            <TableHeader className="sticky top-0 z-10 bg-zinc-50/80 backdrop-blur-md dark:bg-zinc-900/80">
              <TableRow>
                <TableHead>Id</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Entrada</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className='h-24 text-center text-muted-foreground'>
                  Carregando estoque...
                </TableCell>
              </TableRow>
            ) : materials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className='h-24 text-center text-muted-foreground'>
                  Lista de Materiais vazia. Cadastre um novo material para vincular às chapas.
                </TableCell>
              </TableRow>
            ) : (
              materials.map((material) => (
                <TableRow key={material.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b border-white/20 dark:border-white/5">
                  <TableCell className="text-zinc-500 dark:text-zinc-400 font-mono text-xs">{material.id}</TableCell>
                  <TableCell className="font-semibold text-zinc-900 dark:text-zinc-100">{material.name}</TableCell>
                  <TableCell>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300">
                      {material.slug}
                    </span>
                  </TableCell>
                  <TableCell className="text-zinc-500 dark:text-zinc-400 whitespace-nowrap">{formatDate(material.createdAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
      </div>
    </div>
  )
}