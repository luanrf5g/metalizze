'use client'

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { User } from "@/types/user";
import { AlertCircleIcon, Edit2Icon, ShieldCheckIcon, ShieldIcon, UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CreateUserModal } from "@/components/CreateUserModal";
import { EditUserModal } from "@/components/EditUserModal";

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)

    async function fetchUsers() {
        setIsLoading(true)
        setHasError(false)
        try {
            const response = await api.get('/users')
            setUsers(response.data.users)
        } catch (error) {
            console.error('Erro ao buscar Usuários: ', error)
            setHasError(true)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    function translateRole(role: string) {
        switch (role) {
            case 'ADMIN': return 'Administrador'
            case 'OPERATOR': return 'Operador'
            case 'VIEWER': return 'Visualizador'
            default: return role
        }
    }

    return (
        <div className='p-6 md:p-10 max-w-7xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-700'>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400 pb-1">
                        Usuários
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-base font-medium mt-2">
                        Gerencie o acesso e permissões da equipe.
                    </p>
                </div>
                <CreateUserModal onSuccess={fetchUsers} />
            </div>

            {hasError && (
                <Alert variant="destructive">
                    <AlertCircleIcon className="h-4 w-4" />
                    <AlertTitle>Erro</AlertTitle>
                    <AlertDescription>
                        Erro ao tentar buscar a lista de usuários. Tente novamente após alguns momentos.
                    </AlertDescription>
                </Alert>
            )}

            <div className="glass-card overflow-hidden flex-1 min-h-0 flex flex-col p-1">
                <div className="overflow-auto hide-v-scroll flex-1 relative rounded-2xl">
                    <Table>
                        <TableHeader className="bg-zinc-50/80 backdrop-blur-md dark:bg-zinc-900/80">
                            <TableRow>
                                <TableHead className="w-[70px]">#</TableHead>
                                <TableHead>Nome</TableHead>
                                <TableHead>E-mail</TableHead>
                                <TableHead>Papel Funcional</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className='h-24 text-center text-muted-foreground'>
                                        Carregando equipe...
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className='h-24 text-center text-muted-foreground'>
                                        Nenhum usuário encontrado no sistema.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user, index) => (
                                    <TableRow key={user.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b border-white/20 dark:border-white/5">
                                        <TableCell className="font-mono text-xs text-zinc-400 dark:text-zinc-500">#{(index + 1).toString().padStart(3, '0')}</TableCell>
                                        <TableCell className="font-semibold text-zinc-900 dark:text-zinc-100">
                                            <div className="flex items-center gap-2">
                                                {user.role === 'ADMIN' ? (
                                                    <ShieldCheckIcon className="w-5 h-5 text-zinc-900" />
                                                ) : (
                                                    <UserIcon className="w-5 h-5 text-zinc-400" />
                                                )}
                                                {user.name}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-zinc-600 dark:text-zinc-400">{user.email}</TableCell>
                                        <TableCell>
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${user.role === 'ADMIN'
                                                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                                                    : user.role === 'OPERATOR'
                                                        ? 'bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200'
                                                        : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
                                                }`}>
                                                {translateRole(user.role)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => setEditingUser(user)}>
                                                <Edit2Icon className="w-4 h-4 text-zinc-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {editingUser && (
                <EditUserModal
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onSuccess={() => {
                        setEditingUser(null)
                        fetchUsers()
                    }}
                />
            )}
        </div>
    )
}
