'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { api } from '@/lib/api'
import { getToken, removeToken, setToken } from '@/lib/auth'
import { User } from '@/types/user'
import { useRouter } from 'next/navigation'

interface AuthContextData {
    user: User | null
    isLoading: boolean
    isAuthenticated: boolean
    login: (email: string, password: string) => Promise<void>
    logout: () => void
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    const isAuthenticated = !!user

    async function loadUser() {
        const token = getToken()

        if (!token) {
            setIsLoading(false)
            return
        }

        try {
            const response = await api.get('/auth/me')
            setUser(response.data.user)
        } catch {
            removeToken()
            setUser(null)
        } finally {
            setIsLoading(false)
        }
    }

    async function login(email: string, password: string) {
        const response = await api.post('/auth/login', { email, password })
        const { accessToken } = response.data

        setToken(accessToken)

        const meResponse = await api.get('/auth/me')
        setUser(meResponse.data.user)

        router.push('/dashboard')
    }

    function logout() {
        removeToken()
        setUser(null)
        router.push('/login')
    }

    useEffect(() => {
        loadUser()
    }, [])

    return (
        <AuthContext.Provider value={{ user, isLoading, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }

    return context
}
