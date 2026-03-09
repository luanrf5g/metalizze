'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import {
  ArrowRightLeft,
  BoxSelect,
  Component,
  FileText,
  Layers,
  LayoutDashboard,
  Menu,
  Scissors,
  Settings,
  Users,
  UserCog,
  LogOut
} from "lucide-react"
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const menuItems = [
  { name: 'Visão Geral', href: '/', icon: LayoutDashboard, module: 'dashboard' },
  { name: 'Estoque (Chapas)', href: '/sheets', icon: Layers, module: 'sheets' },
  { name: 'Retalhos', href: '/scraps', icon: BoxSelect, module: 'scraps' },
  { name: 'Ordens de Corte', href: '/cut-orders', icon: Scissors, module: 'cut-orders' },
  { name: 'Materiais', href: '/materials', icon: Component, module: 'materials' },
  { name: 'Clientes', href: '/customers', icon: Users, module: 'clients' },
  { name: 'Movimentações', href: '/movements', icon: ArrowRightLeft, module: 'movements' },
  { name: 'Relatórios', href: '/reports', icon: FileText, module: 'reports' },
  { name: 'Usuários', href: '/users', icon: UserCog, module: 'users' },
  { name: 'Configurações', href: '/settings', icon: Settings, module: 'settings' },
];

function SidebarLinks({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname()
  const { user } = useAuth()

  if (!user) return null

  const isAdmin = user.role === 'ADMIN'

  // Filter menu items based on permissions
  const visibleItems = menuItems.filter((item) => {
    if (isAdmin) return true

    if (item.module === 'users') return false

    const modulePerms = user.permissions[item.module]
    if (!modulePerms) return false // DEFAULT DENY

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
    <nav className={cn("flex-1 py-6 space-y-2 overflow-y-auto px-3 hide-scroll", isMobile ? "px-0 space-y-4" : "")}>
      <TooltipProvider delayDuration={0}>
        {visibleItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          const linkContent = (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300 group",
                isActive
                  ? "bg-black/10 text-zinc-950 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] dark:bg-white/10 dark:text-white"
                  : "text-zinc-600 hover:text-zinc-950 hover:bg-black/5 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/5",
                isMobile ? "text-base py-3" : ""
              )}
            >
              <Icon className={cn("w-5 h-5 transition-colors", isActive ? "text-zinc-950 dark:text-white" : "text-zinc-500 group-hover:text-zinc-800 dark:group-hover:text-white")} />
              <span className={cn(isMobile ? "flex" : "hidden lg:flex")}>
                {item.name}
              </span>
            </Link>
          )

          if (isMobile) return linkContent;

          return (
            <Tooltip key={item.name}>
              <TooltipTrigger asChild>
                {linkContent}
              </TooltipTrigger>
              <TooltipContent side="right" className="lg:hidden flex">
                {item.name}
              </TooltipContent>
            </Tooltip>
          )
        })}
      </TooltipProvider>
    </nav>
  )
}

function UserProfile({ isMobile = false }: { isMobile?: boolean }) {
  const { user, logout } = useAuth()

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className={cn("p-4 border-t border-white/30 flex items-center justify-between group/profile transition-colors hover:bg-black/5 dark:hover:bg-white/5", isMobile ? "px-0" : "")}>
      <div className={cn("flex items-center gap-3 py-2", isMobile ? "justify-start" : "justify-center lg:justify-start lg:px-3")}>
        <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md border border-white/20">
          <span className="text-sm font-bold text-white">{initials}</span>
        </div>
        <div className={cn("flex-col", isMobile ? "flex" : "hidden lg:flex")}>
          <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate max-w-[120px]">{user.name}</p>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate max-w-[120px]">{user.email}</p>
        </div>
      </div>
      {(isMobile || !isMobile && true) && (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className={cn("text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors", isMobile ? "flex" : "hidden lg:flex opacity-0 group-hover/profile:opacity-100")}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              Sair
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}

export function Sidebar() {
  return (
    <>
      <Sheet>
        <div className="md:hidden fixed top-0 left-0 w-full h-16 bg-white/40 backdrop-blur-2xl border-b border-white/40 flex items-center px-4 justify-between z-40">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-md shadow-sm"></div>
            <span className="text-zinc-900">Metalizze</span>
          </div>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-xl">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
        </div>
        <SheetContent side="left" className="w-[300px] flex flex-col p-6 bg-white/60 backdrop-blur-3xl border-white/40">
          <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
          <SheetDescription className="sr-only">Navegue pelas páginas do sistema Metalizze.</SheetDescription>
          <div className="flex items-center gap-2 font-bold text-2xl tracking-tight mb-8 mt-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-sm"></div>
            <span className="text-zinc-900">Metalizze</span>
          </div>
          <SidebarLinks isMobile />
          <div className="mt-auto">
            <UserProfile isMobile />
          </div>
        </SheetContent>
      </Sheet>

      <aside className="hidden md:flex flex-col w-20 lg:w-72 bg-white/30 backdrop-blur-3xl text-zinc-950 h-screen border-r border-white/40 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] transition-all duration-300 ease-in-out shrink-0 z-30">
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-white/30 shrink-0">
          <div className="flex items-center gap-3 font-bold text-xl tracking-tight">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md shrink-0 flex items-center justify-center">
              <span className="text-white text-xs">M</span>
            </div>
            <span className="hidden lg:flex text-zinc-900 drop-shadow-sm">Metalizze</span>
          </div>
        </div>

        <SidebarLinks />

        <div className="mt-auto">
          <UserProfile />
        </div>
      </aside>
    </>
  )
}