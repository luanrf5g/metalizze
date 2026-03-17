import { makeUser } from 'test/factories/make-user'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { GetCurrentUserUseCase } from './get-current-user'

let usersRepository: InMemoryUsersRepository
let sut: GetCurrentUserUseCase

describe('Get Current User Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new GetCurrentUserUseCase(usersRepository)
  })

  it('should return the current user', async () => {
    const user = makeUser()
    await usersRepository.create(user)

    const result = await sut.execute({ userId: user.id.toString() })

    expect(result.isRight()).toBe(true)
    expect(result.value?.user.id.toString()).toBe(user.id.toString())
  })

  it('should return left when user does not exist', async () => {
    const result = await sut.execute({ userId: 'missing-user-id' })

    expect(result.isLeft()).toBe(true)
  })
})