'use client'

import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
    const { login } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            await login(email, password)
        } catch {
            setError('E-mail ou senha incorretos.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full h-full flex items-center justify-center mesh-gradient-bg relative">
            {/* Subtle overlay to soften the mesh background for readability */}
            <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]"></div>

            <div className="w-full max-w-md px-4 z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg flex items-center justify-center">
                        <span className="text-white font-bold text-2xl">M</span>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 drop-shadow-sm">Metalizze</h1>
                </div>

                <Card className="shadow-2xl border-white/40 bg-white/60 backdrop-blur-md rounded-2xl overflow-hidden">
                    <CardHeader className="text-center pb-2 bg-white/40 border-b border-white/30">
                        <CardTitle className="text-xl font-bold text-zinc-900">Entrar no Sistema</CardTitle>
                        <p className="text-sm text-zinc-600 mt-1 font-medium">
                            Acesse com suas credenciais fornecidas pelo administrador.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-zinc-700">E-mail</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="border-white/50 bg-white/50 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 shadow-sm transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-zinc-700">Senha</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="border-white/50 bg-white/50 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20 shadow-sm transition-all"
                                />
                            </div>

                            {error && (
                                <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-md border border-red-200">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-zinc-900 to-zinc-800 hover:from-zinc-800 hover:to-zinc-700 text-white shadow-md hover:shadow-lg transition-all"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Entrando...' : 'Entrar'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <p className="text-xs text-zinc-600/80 font-medium text-center mt-6">
                    Metalizze ERP &copy; {new Date().getFullYear()}
                </p>
            </div>
        </div>
    )
}
