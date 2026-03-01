'use client'

import { usePathname } from "next/navigation"
import { AuthProvider } from "./AuthProvider"
import { Sidebar } from "./Sidebar"
import { useAuth } from "./AuthProvider"

function AppShellInner({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const { isAuthenticated, isLoading } = useAuth()

    const isLoginPage = pathname === '/login'

    if (isLoginPage) {
        return <>{children}</>
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-zinc-400 text-sm">Carregando...</div>
            </div>
        )
    }

    if (isAuthenticated) {
        return (
            <div className="flex min-h-screen">
                <Sidebar />
                <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
                    <div className="flex-1 overflow-y-auto">
                        {children}
                    </div>
                </main>
            </div>
        )
    }

    return <>{children}</>
}

export function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <AppShellInner>{children}</AppShellInner>
        </AuthProvider>
    )
}
