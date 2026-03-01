'use client'

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { User } from "@/types/user"
import { useAuth } from "@/components/AuthProvider"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { CreateUserModal } from "@/components/CreateUserModal"
import { EditUserModal } from "@/components/EditUserModal"
import { toast } from "sonner"
import { formatDate } from "@/lib/formatters"
import { Shield, ShieldCheck, Eye, Pencil, Trash2 } from "lucide-react"

const roleLabels: Record<string, string> = {
  ADMIN: 'Administrador',
  OPERATOR: 'Operador',
  VIEWER: 'Visualizador',
}

const roleIcons: Record<string, React.ReactNode> = {
  ADMIN: <ShieldCheck className="w-4 h-4 text-amber-600" />,
  OPERATOR: <Shield className="w-4 h-4 text-blue-600" />,
  VIEWER: <Eye className="w-4 h-4 text-zinc-500" />,
}

export default function SettingsPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  async function fetchUsers() {
    setIsLoading(true)
    try {
      const response = await api.get('/users')
      setUsers(response.data.users)
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDeleteUser(userId: string) {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return

    try {
      await api.delete(`/users/${userId}`)
      toast.success('Usuário removido com sucesso.')
      fetchUsers()
    } catch {
      toast.error('Erro ao remover usuário.')
    }
  }

  async function handleToggleActive(user: User) {
    try {
      await api.patch(`/users/${user.id}`, { isActive: !user.isActive })
      toast.success(user.isActive ? 'Usuário desativado.' : 'Usuário ativado.')
      fetchUsers()
    } catch {
      toast.error('Erro ao alterar status do usuário.')
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-x-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie usuários e permissões do sistema.
          </p>
        </div>
        <CreateUserModal onSuccess={fetchUsers} />
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Papel</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Carregando usuários...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Nenhum usuário cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-zinc-500">{u.email}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5">
                      {roleIcons[u.role]}
                      <span className="text-sm">{roleLabels[u.role]}</span>
                    </span>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleToggleActive(u)}
                      className={`px-2 py-1 rounded-md text-xs font-medium cursor-pointer ${u.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                        }`}
                    >
                      {u.isActive ? 'Ativo' : 'Inativo'}
                    </button>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(u.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingUser(u)}
                        className="cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      {u.id !== currentUser?.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(u.id)}
                          className="text-red-500 hover:text-red-700 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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