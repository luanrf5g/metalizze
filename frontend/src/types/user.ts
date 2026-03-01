export type UserRole = 'ADMIN' | 'OPERATOR' | 'VIEWER'

export interface UserPermissions {
    [module: string]: {
        read?: boolean
        write?: boolean
        delete?: boolean
    }
}

export interface User {
    id: string
    name: string
    email: string
    role: UserRole
    permissions: UserPermissions
    isActive: boolean
    createdAt: string
}
