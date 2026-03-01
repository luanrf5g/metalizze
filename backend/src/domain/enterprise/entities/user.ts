import { Entity } from '@/core/entities/entity'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'

export interface UserPermissions {
    [module: string]: {
        read?: boolean
        write?: boolean
        delete?: boolean
    }
}

export interface UserProps {
    name: string
    email: string
    password: string
    role: 'ADMIN' | 'OPERATOR' | 'VIEWER'
    permissions: UserPermissions
    isActive: boolean
    createdAt: Date
    updatedAt?: Date | null
}

export class User extends Entity<UserProps> {
    get name() { return this.props.name }
    set name(value: string) { this.props.name = value; this.touch() }

    get email() { return this.props.email }
    set email(value: string) { this.props.email = value; this.touch() }

    get password() { return this.props.password }
    set password(value: string) { this.props.password = value; this.touch() }

    get role() { return this.props.role }
    set role(value: 'ADMIN' | 'OPERATOR' | 'VIEWER') { this.props.role = value; this.touch() }

    get permissions() { return this.props.permissions }
    set permissions(value: UserPermissions) { this.props.permissions = value; this.touch() }

    get isActive() { return this.props.isActive }
    set isActive(value: boolean) { this.props.isActive = value; this.touch() }

    get createdAt() { return this.props.createdAt }
    get updatedAt() { return this.props.updatedAt }

    private touch() {
        this.props.updatedAt = new Date()
    }

    hasPermission(module: string, action: 'read' | 'write' | 'delete'): boolean {
        if (this.role === 'ADMIN') return true
        const modulePermissions = this.permissions[module]
        if (!modulePermissions) return false
        return modulePermissions[action] === true
    }

    static create(
        props: Optional<UserProps, 'createdAt' | 'role' | 'permissions' | 'isActive'>,
        id?: UniqueEntityId
    ) {
        const user = new User(
            {
                ...props,
                role: props.role ?? 'OPERATOR',
                permissions: props.permissions ?? {},
                isActive: props.isActive ?? true,
                createdAt: props.createdAt ?? new Date(),
            },
            id
        )
        return user
    }
}
