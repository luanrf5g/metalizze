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
        <div className="min-h-screen flex items-center justify-center bg-zinc-100">
            <div className="w-full max-w-md px-4">
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-zinc-900 rounded-lg"></div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Metalizze</h1>
                </div>

                <Card className="shadow-lg border-zinc-200">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-xl font-semibold text-zinc-800">Entrar no Sistema</CardTitle>
                        <p className="text-sm text-zinc-500 mt-1">
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
                                    className="border-zinc-300 focus:border-zinc-500"
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
                                    className="border-zinc-300 focus:border-zinc-500"
                                />
                            </div>

                            {error && (
                                <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-md border border-red-200">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white cursor-pointer"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Entrando...' : 'Entrar'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <p className="text-xs text-zinc-400 text-center mt-6">
                    Metalizze ERP &copy; {new Date().getFullYear()}
                </p>
            </div>
        </div>
    )
}
