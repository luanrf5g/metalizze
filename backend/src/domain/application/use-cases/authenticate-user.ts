import { Injectable } from '@nestjs/common'
import { UsersRepository } from '../repositories/users-repository'
import { Either, left, right } from '@/core/logic/Either'
import { WrongCredentialsError } from './errors/wrong-credentials-error'
import { compare } from 'bcryptjs'
import { JwtService } from '@nestjs/jwt'

interface AuthenticateUserUseCaseRequest {
    email: string
    password: string
}

type AuthenticateUserUseCaseResponse = Either<
    WrongCredentialsError,
    { accessToken: string }
>

@Injectable()
export class AuthenticateUserUseCase {
    constructor(
        private usersRepository: UsersRepository,
        private jwt: JwtService,
    ) { }

    async execute({
        email,
        password,
    }: AuthenticateUserUseCaseRequest): Promise<AuthenticateUserUseCaseResponse> {
        const user = await this.usersRepository.findByEmail(email)

        if (!user) {
            return left(new WrongCredentialsError())
        }

        if (!user.isActive) {
            return left(new WrongCredentialsError())
        }

        const isPasswordValid = await compare(password, user.password)

        if (!isPasswordValid) {
            return left(new WrongCredentialsError())
        }

        const accessToken = this.jwt.sign({
            sub: user.id.toString(),
            role: user.role,
        })

        return right({ accessToken })
    }
}
