'use client'

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { formatDate, translateSheetType } from "@/lib/formatters";
import { Material } from "@/types/material";
import { Sheet } from "@/types/sheet";
import { AlertCircleIcon, Trash2, Check, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CreateMaterialModal } from "@/components/CreateMaterialModal";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";
import Link from "next/link";

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Inline editing
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const editInputRef = useRef<HTMLInputElement>(null)

  // Conflict modal (delete blocked by linked sheets)
  const [conflictModalOpen, setConflictModalOpen] = useState(false)
  const [conflictSheets, setConflictSheets] = useState<Sheet[]>([])
  const [conflictMaterialName, setConflictMaterialName] = useState('')

  const { user } = useAuth()
  const canCreate = user?.role === 'ADMIN' || user?.permissions?.['materials']?.write
  const canEdit = user?.role === 'ADMIN' || user?.permissions?.['materials']?.write

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

  // Inline edit handlers
  function startEditing(material: Material) {
    setEditingId(material.id)
    setEditingName(material.name)
    setTimeout(() => editInputRef.current?.focus(), 0)
  }

  function cancelEditing() {
    setEditingId(null)
    setEditingName('')
  }

  async function saveEdit(materialId: string) {
    const trimmed = editingName.trim()
    const original = materials.find(m => m.id === materialId)

    if (!trimmed || trimmed === original?.name) {
      cancelEditing()
      return
    }

    try {
      await api.patch(`/materials/${materialId}`, { name: trimmed })
      toast.success('Material atualizado com sucesso!')
      cancelEditing()
      await fetchMaterials()
    } catch (error) {
      console.error('Erro ao editar material:', error)
      toast.error('Erro ao atualizar o material.')
    }
  }

  function handleEditKeyDown(e: React.KeyboardEvent, materialId: string) {
    if (e.key === 'Enter') {
      e.preventDefault()
      saveEdit(materialId)
    } else if (e.key === 'Escape') {
      cancelEditing()
    }
  }

  // Delete handler
  async function handleDelete(material: Material) {
    try {
      await api.delete(`/materials/${material.id}`)
      toast.success('Material excluído com sucesso!')
      await fetchMaterials()
    } catch (error: any) {
      if (error.response?.status === 409) {
        // Material has linked sheets — fetch them and show conflict modal
        setConflictMaterialName(material.name)
        try {
          const res = await api.get(`/sheets?materialId=${material.id}`)
          setConflictSheets(res.data.sheets || [])
        } catch {
          setConflictSheets([])
        }
        setConflictModalOpen(true)
      } else {
        console.error('Erro ao excluir material:', error)
        toast.error('Erro ao excluir o material.')
      }
    }
  }

  return (
    <div className='p-6 md:p-10 w-full h-full mx-auto flex flex-col animate-in fade-in zoom-in-95 duration-700'>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between shrink-0 mb-6 gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400 pb-1">Materiais</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mt-1">Gerencie os tipos de materiais e suas especificações.</p>
        </div>
        {canCreate && <CreateMaterialModal onSuccess={fetchMaterials} />}
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
                <TableHead className="w-[70px]">#</TableHead>
                <TableHead>Id</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Entrada</TableHead>
                {canEdit && <TableHead className="w-[70px]">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={canEdit ? 6 : 5} className='h-24 text-center text-muted-foreground'>
                    Carregando estoque...
                  </TableCell>
                </TableRow>
              ) : materials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canEdit ? 6 : 5} className='h-24 text-center text-muted-foreground'>
                    Lista de Materiais vazia. Cadastre um novo material para vincular às chapas.
                  </TableCell>
                </TableRow>
              ) : (
                materials.map((material, index) => (
                  <TableRow key={material.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b border-white/20 dark:border-white/5">
                    <TableCell className="font-mono text-xs text-zinc-400 dark:text-zinc-500">#{(index + 1).toString().padStart(3, '0')}</TableCell>
                    <TableCell className="text-zinc-500 dark:text-zinc-400 font-mono text-xs">{material.id}</TableCell>
                    <TableCell className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {editingId === material.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            ref={editInputRef}
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => handleEditKeyDown(e, material.id)}
                            className="font-semibold text-zinc-900 dark:text-zinc-100 bg-transparent border-b-2 border-blue-400 focus:border-blue-500 outline-none w-full py-0.5"
                          />
                          <button onClick={() => saveEdit(material.id)} className="text-emerald-500 hover:text-emerald-600 transition-colors p-0.5 hover:cursor-pointer">
                            <Check className="h-4 w-4" />
                          </button>
                          <button onClick={cancelEditing} className="text-zinc-400 hover:text-zinc-600 transition-colors p-0.5 hover:cursor-pointer">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <span
                          onClick={() => canEdit && startEditing(material)}
                          className={canEdit ? "cursor-pointer hover:underline hover:decoration-blue-400 hover:decoration-2 hover:underline-offset-4 transition-all" : ""}
                          title={canEdit ? "Clique para editar" : undefined}
                        >
                          {material.name}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300">
                        {material.slug}
                      </span>
                    </TableCell>
                    <TableCell className="text-zinc-500 dark:text-zinc-400 whitespace-nowrap">{formatDate(material.createdAt)}</TableCell>
                    {canEdit && (
                      <TableCell>
                        <button
                          onClick={() => handleDelete(material)}
                          className="text-zinc-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 hover:cursor-pointer"
                          title="Excluir material"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Conflict Modal — Material has linked sheets */}
      <Dialog open={conflictModalOpen} onOpenChange={setConflictModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-red-600 dark:text-red-400">Não é possível excluir o material</DialogTitle>
            <DialogDescription className="text-sm text-zinc-600 dark:text-zinc-400 pt-1">
              Para excluir o material <strong className="text-zinc-900 dark:text-zinc-100">{conflictMaterialName}</strong>, desvincule as chapas ligadas a esse material ou apenas altere o nome do material.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto mt-4">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              Chapas vinculadas ({conflictSheets.length})
            </p>
            <div className="space-y-2">
              {conflictSheets.map((sheet) => (
                <Link
                  key={sheet.id}
                  href={`/sheets/${sheet.id}`}
                  onClick={() => setConflictModalOpen(false)}
                  className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {sheet.sku}
                    </span>
                    <span className="text-xs text-zinc-500">
                      Qtd: {sheet.quantity} un
                    </span>
                  </div>
                  <span className={`px-3 py-0.5 rounded-full text-xs font-semibold ${sheet.type === 'SCRAP'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                    }`}>
                    {translateSheetType(sheet.type)}
                  </span>
                </Link>
              ))}
              {conflictSheets.length === 0 && (
                <p className="text-sm text-zinc-400 italic text-center py-4">
                  Não foi possível carregar as chapas vinculadas.
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => setConflictModalOpen(false)}>
              Entendi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}