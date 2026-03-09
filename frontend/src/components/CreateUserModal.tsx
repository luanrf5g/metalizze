'use client'

import { useState } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Plus } from "lucide-react"

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
    onSuccess: () => void
}

export function CreateUserModal({ onSuccess }: Props) {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState<'ADMIN' | 'OPERATOR' | 'VIEWER'>('OPERATOR')
    const [permissions, setPermissions] = useState<Record<string, { read?: boolean; write?: boolean; delete?: boolean }>>({})
    const [isLoading, setIsLoading] = useState(false)

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
            await api.post('/users', {
                name,
                email,
                password,
                role,
                permissions: role === 'ADMIN' ? {} : permissions,
            })

            toast.success('Usuário criado com sucesso!')
            setName('')
            setEmail('')
            setPassword('')
            setRole('OPERATOR')
            setPermissions({})
            setOpen(false)
            onSuccess()
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Erro ao criar usuário.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-zinc-900 hover:bg-zinc-800 text-white cursor-pointer">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Usuário
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Criar Novo Usuário</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-4">
                    <div className="space-y-2">
                        <Label>Nome</Label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label>E-mail</Label>
                        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label>Senha</Label>
                        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                    </div>
                    <div className="space-y-2">
                        <Label>Papel</Label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value as 'ADMIN' | 'OPERATOR' | 'VIEWER')}
                            className="w-full border border-white/30 dark:border-white/20 bg-white/70 dark:bg-zinc-900/70 rounded-md px-3 py-2 text-sm"
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
                                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{mod.label}</span>
                                        <div className="flex items-center gap-3">
                                            {(['read', 'write', 'delete'] as const).map((action) => (
                                                <label key={action} className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                                                    <input
                                                        type="checkbox"
                                                        checked={role === 'VIEWER' ? action === 'read' : (permissions[mod.key]?.[action] || false)}
                                                        onChange={() => role !== 'VIEWER' && togglePermission(mod.key, action)}
                                                        disabled={role === 'VIEWER'}
                                                        className="rounded cursor-pointer disabled:cursor-not-allowed"
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

                    <Button type="submit" className="w-full bg-zinc-900 hover:bg-zinc-800 text-white cursor-pointer" disabled={isLoading}>
                        {isLoading ? 'Criando...' : 'Criar Usuário'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
