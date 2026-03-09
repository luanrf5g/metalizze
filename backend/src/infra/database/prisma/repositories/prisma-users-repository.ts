import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { UsersRepository } from '@/domain/application/repositories/users-repository'
import { User } from '@/domain/enterprise/entities/user'
import { PrismaUserMapper } from '../mappers/prisma-user-mapper'
import { PaginationParams } from '@/core/repositories/pagination-params'

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
    constructor(private prisma: PrismaService) { }

    async create(user: User): Promise<void> {
        const data = PrismaUserMapper.toPrisma(user)
        await this.prisma.user.create({ data })
    }

    async save(user: User): Promise<void> {
        const data = PrismaUserMapper.toPrisma(user)
        await this.prisma.user.update({
            where: { id: data.id },
            data,
        })
    }

    async delete(id: string): Promise<void> {
        await this.prisma.user.delete({ where: { id } })
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({ where: { email } })
        if (!user) return null
        return PrismaUserMapper.toDomain(user)
    }

    async findById(id: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({ where: { id } })
        if (!user) return null
        return PrismaUserMapper.toDomain(user)
    }

    async findMany({ page }: PaginationParams): Promise<User[]> {
        const users = await this.prisma.user.findMany({
            take: 20,
            skip: (page - 1) * 20,
            orderBy: { createdAt: 'desc' },
        })
        return users.map(PrismaUserMapper.toDomain)
    }
}
