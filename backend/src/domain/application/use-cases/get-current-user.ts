import { Injectable } from '@nestjs/common'
import { UsersRepository } from '../repositories/users-repository'
import { Either, left, right } from '@/core/logic/Either'
import { User } from '@/domain/enterprise/entities/user'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

interface GetCurrentUserUseCaseRequest {
    userId: string
}

type GetCurrentUserUseCaseResponse = Either<ResourceNotFoundError, { user: User }>

@Injectable()
export class GetCurrentUserUseCase {
    constructor(private usersRepository: UsersRepository) { }

    async execute({ userId }: GetCurrentUserUseCaseRequest): Promise<GetCurrentUserUseCaseResponse> {
        const user = await this.usersRepository.findById(userId)

        if (!user) {
            return left(new ResourceNotFoundError())
        }

        return right({ user })
    }
}
