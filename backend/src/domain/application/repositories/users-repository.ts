import { PaginationParams } from '@/core/repositories/pagination-params'
import { User } from '@/domain/enterprise/entities/user'

export abstract class UsersRepository {
    abstract create(user: User): Promise<void>
    abstract save(user: User): Promise<void>
    abstract delete(id: string): Promise<void>
    abstract findByEmail(email: string): Promise<User | null>
    abstract findById(id: string): Promise<User | null>
    abstract findMany(params: PaginationParams): Promise<User[]>
}
