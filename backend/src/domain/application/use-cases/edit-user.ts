import { Injectable } from '@nestjs/common'
import { UsersRepository } from '../repositories/users-repository'
import { Either, left, right } from '@/core/logic/Either'
import { User, UserPermissions } from '@/domain/enterprise/entities/user'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { hash } from 'bcryptjs'

export interface EditUserUseCaseRequest {
    userId: string
    name?: string
    email?: string
    password?: string
    role?: 'ADMIN' | 'OPERATOR' | 'VIEWER'
    permissions?: UserPermissions
    isActive?: boolean
}

type EditUserUseCaseResponse = Either<ResourceNotFoundError, { user: User }>

@Injectable()
export class EditUserUseCase {
    constructor(private usersRepository: UsersRepository) { }

    async execute(request: EditUserUseCaseRequest): Promise<EditUserUseCaseResponse> {
        const user = await this.usersRepository.findById(request.userId)

        if (!user) {
            return left(new ResourceNotFoundError())
        }

        if (request.name !== undefined) user.name = request.name
        if (request.email !== undefined) user.email = request.email
        if (request.role !== undefined) user.role = request.role
        if (request.permissions !== undefined) user.permissions = request.permissions
        if (request.isActive !== undefined) user.isActive = request.isActive

        if (request.password) {
            user.password = await hash(request.password, 8)
        }

        await this.usersRepository.save(user)

        return right({ user })
    }
}
