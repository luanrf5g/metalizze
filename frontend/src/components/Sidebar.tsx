'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRightLeft,
  BoxSelect,
  Component,
  FileText,
  Layers,
  LayoutDashboard,
  LogOut,
  Scissors,
  Settings,
  Users
} from "lucide-react"
import { cn } from "@/lib/utils";
import { useAuth } from "./AuthProvider";

const menuItems = [
  { name: 'Visão Geral', href: '/dashboard', icon: LayoutDashboard, module: 'dashboard' },
  { name: 'Estoque (Chapas)', href: '/', icon: Layers, module: 'sheets' },
  { name: 'Retalhos', href: '/scraps', icon: BoxSelect, module: 'sheets' },
  { name: 'Ordens de Corte', href: '/cut-orders', icon: Scissors, module: 'sheets' },
  { name: 'Materiais', href: '/materials', icon: Component, module: 'materials' },
  { name: 'Clientes', href: '/customers', icon: Users, module: 'clients' },
  { name: 'Movimentações', href: '/movements', icon: ArrowRightLeft, module: 'movements' },
  { name: 'Relatórios', href: '/reports', icon: FileText, module: 'reports' },
];

const adminMenuItems = [
  { name: 'Configurações', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  if (!user) return null

  const isAdmin = user.role === 'ADMIN'

  // Filter menu items based on permissions
  const visibleItems = menuItems.filter((item) => {
    if (isAdmin) return true

    const modulePerms = user.permissions[item.module]
    if (!modulePerms) return true // If no specific permission set, allow read by default

    return modulePerms.read !== false
  })

  // Get user initials
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white text-zinc-950 min-h-screen border-r border-zinc-200">

      {/* Logotipo / Nome do Sistema */}
      <div className="h-16 flex items-center px-6 border-b border-zinc-200">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="w-6 h-6 bg-zinc-900 rounded-md"></div>
          <span className="text-zinc-900">Metalizze</span>
        </div>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-200 text-gray-700"
                  : "text-gray-400 hover:text-gray-700 hover:bg-gray-200"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          )
        })}

        {/* Admin-only menu items */}
        {isAdmin && (
          <>
            <div className="pt-4 pb-2 px-3">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Administração
              </p>
            </div>
            {adminMenuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-gray-200 text-gray-700"
                      : "text-gray-400 hover:text-gray-700 hover:bg-gray-200"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              )
            })}
          </>
        )}
      </nav>

      {/* Perfil do Usuário + Logout */}
      <div className="p-4 border-t border-zinc-200">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center">
            <span className="text-xs font-bold text-zinc-50">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-zinc-900 truncate">{user.name}</p>
            <p className="text-xs text-zinc-500 truncate">{user.email}</p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}