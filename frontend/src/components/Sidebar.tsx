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
  Scissors,
  Settings,
  Users
} from "lucide-react"
import { cn } from "@/lib/utils";

const menuItems = [
  { name: 'Visão Geral', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Estoque (Chapas)', href: '/', icon: Layers },
  { name: 'Retalhos', href: '/scraps', icon: BoxSelect },
  { name: 'Ordens de Corte', href: '/cut-orders', icon: Scissors },
  { name: 'Materiais', href: '/materials', icon: Component },
  { name: 'Clientes', href: '/customers', icon: Users },
  { name: 'Movimentações', href: '/movements', icon: ArrowRightLeft },
  { name: 'Relatórios', href: '/reports', icon: FileText },
  { name: 'Configurações', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname()

  return (
    // Fundo branco com borda sutil em zinc-200 para separar do resto da tela
    <aside className="hidden md:flex flex-col w-64 bg-white text-zinc-950 min-h-screen border-r border-zinc-200">

      {/* Logotipo / Nome do Sistema */}
      <div className="h-16 flex items-center px-6 border-b border-zinc-200">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="w-6 h-6 bg-zinc-900 rounded-md"></div> {/* Logo mais escuro para dar contraste */}
          <span className="text-zinc-900">Metalizze</span>
        </div>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-color",
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
      </nav>

      {/* Perfil do Usuário */}
      <div className="p-4 border-t border-zinc-200">
        <div className="flex items-center gap-3 px-3 py-2">
          {/* Avatar com alto contraste */}
          <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center">
            <span className="text-xs font-bold text-zinc-50">OP</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-zinc-900">Operador</p>
            <p className="text-xs text-zinc-500">oficina@metalizze.com</p>
          </div>
        </div>
      </div>
    </aside>
  )
}