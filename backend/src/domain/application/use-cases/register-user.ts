import { Injectable } from '@nestjs/common'
import { UsersRepository } from '../repositories/users-repository'
import { Either, left, right } from '@/core/logic/Either'
import { UserAlreadyExistsError } from './errors/user-already-exists-error'
import { User, UserPermissions } from '@/domain/enterprise/entities/user'
import { hash } from 'bcryptjs'

interface RegisterUserUseCaseRequest {
    name: string
    email: string
    password: string
    role?: 'ADMIN' | 'OPERATOR' | 'VIEWER'
    permissions?: UserPermissions
}

type RegisterUserUseCaseResponse = Either<
    UserAlreadyExistsError,
    { user: User }
>

@Injectable()
export class RegisterUserUseCase {
    constructor(private usersRepository: UsersRepository) { }

    async execute({
        name,
        email,
        password,
        role,
        permissions,
    }: RegisterUserUseCaseRequest): Promise<RegisterUserUseCaseResponse> {
        const userWithSameEmail = await this.usersRepository.findByEmail(email)

        if (userWithSameEmail) {
            return left(new UserAlreadyExistsError(email))
        }

        const hashedPassword = await hash(password, 8)

        const user = User.create({
            name,
            email,
            password: hashedPassword,
            role,
            permissions,
        })

        await this.usersRepository.create(user)

        return right({ user })
    }
}
