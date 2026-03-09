'use client'

import { useState } from "react"
import { api } from "@/lib/api"
import { User } from "@/types/user"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { useAuth } from "./AuthProvider"
import { Trash2Icon } from "lucide-react"

const MODULES = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'sheets', label: 'Chapas' },
    { key: 'cut-orders', label: 'Ordens de Corte' },
    { key: 'materials', label: 'Materiais' },
    { key: 'clients', label: 'Clientes' },
    { key: 'movements', label: 'Movimentações' },
    { key: 'reports', label: 'Relatórios' },
]

interface Props {
    user: User
    onClose: () => void
    onSuccess: () => void
}

export function EditUserModal({ user, onClose, onSuccess }: Props) {
    const [name, setName] = useState(user.name)
    const [email, setEmail] = useState(user.email)
    const [role, setRole] = useState(user.role)
    const [permissions, setPermissions] = useState<Record<string, { read?: boolean; write?: boolean; delete?: boolean }>>(
        user.permissions || {}
    )
    const [isLoading, setIsLoading] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const { user: loggedUser } = useAuth()

    const isAdmin = loggedUser?.role === 'ADMIN'

    function togglePermission(module: string, action: 'read' | 'write' | 'delete') {
        setPermissions((prev) => {
            const current = prev[module] || {}
            return {
                ...prev,
                [module]: {
                    ...current,
                    [action]: !current[action],
                },
            }
        })
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsLoading(true)

        try {
            await api.patch(`/users/${user.id}`, {
                name,
                email,
                role,
                permissions: role === 'ADMIN' ? {} : permissions,
            })

            toast.success('Usuário atualizado com sucesso!')
            onSuccess()
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Erro ao atualizar usuário.')
        } finally {
            setIsLoading(false)
        }
    }

    async function handleDelete() {
        if (!isAdmin) {
            toast.error('Apenas administradores podem deletar usuários.')
            return
        }

        const confirmed = confirm(`Tem certeza que deseja deletar o usuário "${user.name}"? Esta ação não pode ser desfeita.`)
        if (!confirmed) return

        setIsDeleting(true)

        try {
            await api.delete(`/users/${user.id}`)
            toast.success('Usuário deletado com sucesso!')
            onSuccess()
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Erro ao deletar usuário.')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <Dialog open onOpenChange={() => onClose()}>
            <DialogContent className="max-w-lg bg-white">
                <DialogHeader>
                    <DialogTitle>Editar Usuário</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Nome</Label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label>E-mail</Label>
                        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label>Papel</Label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value as 'ADMIN' | 'OPERATOR' | 'VIEWER')}
                            className="w-full border border-zinc-300 rounded-md px-3 py-2 text-sm"
                        >
                            <option value="ADMIN">Administrador</option>
                            <option value="OPERATOR">Operador</option>
                            <option value="VIEWER">Visualizador</option>
                        </select>
                    </div>

                    {role !== 'ADMIN' && (
                        <div className="space-y-3">
                            <Label>Permissões por Módulo</Label>
                            <div className="border rounded-md divide-y">
                                {MODULES.map((mod) => (
                                    <div key={mod.key} className="flex items-center justify-between px-3 py-2">
                                        <span className="text-sm font-medium text-zinc-700">{mod.label}</span>
                                        <div className="flex items-center gap-3">
                                            {(['read', 'write', 'delete'] as const).map((action) => (
                                                <label key={action} className="flex items-center gap-1 text-xs text-zinc-500">
                                                    <input
                                                        type="checkbox"
                                                        checked={permissions[mod.key]?.[action] || false}
                                                        onChange={() => togglePermission(mod.key, action)}
                                                        className="rounded"
                                                    />
                                                    {action === 'read' ? 'Ler' : action === 'write' ? 'Escr.' : 'Excl.'}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3">
                        {isAdmin && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isDeleting || isLoading}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-md text-sm font-medium transition-colors cursor-pointer"
                            >
                                <Trash2Icon size={16} />
                                {isDeleting ? 'Deletando...' : 'Deletar'}
                            </button>
                        )}
                        <Button type="button" variant="outline" onClick={onClose} className="flex-1 cursor-pointer">
                            Cancelar
                        </Button>
                        <Button type="submit" className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white cursor-pointer" disabled={isLoading || isDeleting}>
                            {isLoading ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
