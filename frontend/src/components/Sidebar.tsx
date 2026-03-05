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
  Menu,
  Scissors,
  Settings,
  Users
} from "lucide-react"
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const menuItems = [
  { name: 'Visão Geral', href: '/', icon: LayoutDashboard },
  { name: 'Estoque (Chapas)', href: '/sheets', icon: Layers },
  { name: 'Retalhos', href: '/scraps', icon: BoxSelect },
  { name: 'Ordens de Corte', href: '/cut-orders', icon: Scissors },
  { name: 'Materiais', href: '/materials', icon: Component },
  { name: 'Clientes', href: '/customers', icon: Users },
  { name: 'Movimentações', href: '/movements', icon: ArrowRightLeft },
  { name: 'Relatórios', href: '/reports', icon: FileText },
  { name: 'Configurações', href: '/settings', icon: Settings },
];

function SidebarLinks({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname()

  return (
    <nav className={cn("flex-1 py-6 space-y-2 overflow-y-auto px-3", isMobile ? "px-0 space-y-4" : "")}>
      <TooltipProvider delayDuration={0}>
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          const linkContent = (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all group",
                isActive
                  ? "bg-zinc-900 text-zinc-50"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100",
                isMobile ? "text-base py-3" : ""
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-zinc-50" : "text-zinc-500 group-hover:text-zinc-900")} />
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
  return (
    <div className={cn("p-4 border-t border-zinc-200", isMobile ? "px-0" : "")}>
      <div className={cn("flex items-center gap-3 py-2", isMobile ? "justify-start" : "justify-center lg:justify-start lg:px-3")}>
        <div className="w-9 h-9 shrink-0 rounded-full bg-blue-600 flex items-center justify-center shadow-sm">
          <span className="text-sm font-bold text-white">OP</span>
        </div>
        <div className={cn("flex-col", isMobile ? "flex" : "hidden lg:flex")}>
          <p className="text-sm font-semibold text-zinc-900">Operador</p>
          <p className="text-xs text-zinc-500 truncate max-w-[150px]">oficina@metalizze.com</p>
        </div>
      </div>
    </div>
  )
}

export function Sidebar() {
  return (
    <>
      <Sheet>
        <div className="md:hidden fixed top-0 left-0 w-full h-16 bg-white border-b border-zinc-200 flex items-center px-4 justify-between z-40">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-6 h-6 bg-blue-600 rounded-md shadow-sm"></div>
            <span className="text-zinc-900">Metalizze</span>
          </div>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
        </div>
        <SheetContent side="left" className="w-[300px] flex flex-col p-6">
          <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
          <SheetDescription className="sr-only">Navegue pelas páginas do sistema Metalizze.</SheetDescription>
          <div className="flex items-center gap-2 font-bold text-2xl tracking-tight mb-8 mt-4">
            <div className="w-8 h-8 bg-blue-600 rounded-md shadow-sm"></div>
            <span className="text-zinc-900">Metalizze</span>
          </div>
          <SidebarLinks isMobile />
          <div className="mt-auto">
            <UserProfile isMobile />
          </div>
        </SheetContent>
      </Sheet>

      <aside className="hidden md:flex flex-col w-20 lg:w-72 bg-white text-zinc-950 h-screen border-r border-zinc-200 transition-all duration-300 ease-in-out shrink-0 z-30">
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-zinc-200 shrink-0">
          <div className="flex items-center gap-3 font-bold text-xl tracking-tight">
            <div className="w-7 h-7 bg-blue-600 rounded-lg shadow-sm shrink-0 flex items-center justify-center">
               <span className="text-white text-xs">M</span>
            </div>
            <span className="hidden lg:flex text-zinc-900">Metalizze</span>
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