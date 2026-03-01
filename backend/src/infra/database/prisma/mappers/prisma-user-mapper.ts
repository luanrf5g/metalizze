import { User as PrismaUser } from '@prisma/client'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { User, UserPermissions } from '@/domain/enterprise/entities/user'

export class PrismaUserMapper {
    static toDomain(raw: PrismaUser): User {
        return User.create(
            {
                name: raw.name,
                email: raw.email,
                password: raw.password,
                role: raw.role,
                permissions: (raw.permissions as UserPermissions) ?? {},
                isActive: raw.isActive,
                createdAt: raw.createdAt,
                updatedAt: raw.updatedAt,
            },
            new UniqueEntityId(raw.id)
        )
    }

    static toPrisma(user: User) {
        return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            password: user.password,
            role: user.role,
            permissions: user.permissions as any,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }
    }
}
