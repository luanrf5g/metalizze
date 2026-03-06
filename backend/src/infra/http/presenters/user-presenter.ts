import { User } from '@/domain/enterprise/entities/user'

export class UserPresenter {
    static toHTTP(user: User) {
        return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            permissions: user.permissions,
            isActive: user.isActive,
            createdAt: user.createdAt,
        }
    }
}
