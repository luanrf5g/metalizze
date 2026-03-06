import { Injectable } from '@nestjs/common'
import { UsersRepository } from '../repositories/users-repository'
import { Either, right } from '@/core/logic/Either'
import { User } from '@/domain/enterprise/entities/user'

interface FetchUsersUseCaseRequest {
    page: number
}

type FetchUsersUseCaseResponse = Either<null, { users: User[] }>

@Injectable()
export class FetchUsersUseCase {
    constructor(private usersRepository: UsersRepository) { }

    async execute({ page }: FetchUsersUseCaseRequest): Promise<FetchUsersUseCaseResponse> {
        const users = await this.usersRepository.findMany({ page })
        return right({ users })
    }
}
