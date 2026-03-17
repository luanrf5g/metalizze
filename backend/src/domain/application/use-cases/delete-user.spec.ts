import { makeUser } from 'test/factories/make-user'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { DeleteUserUseCase } from './delete-user'

let usersRepository: InMemoryUsersRepository
let sut: DeleteUserUseCase

describe('Delete User Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new DeleteUserUseCase(usersRepository)
  })

  it('should delete an existing user', async () => {
    const user = makeUser()
    await usersRepository.create(user)

    const result = await sut.execute({ userId: user.id.toString() })

    expect(result.isRight()).toBe(true)
    expect(usersRepository.items).toHaveLength(0)
  })

  it('should return left when deleting a missing user', async () => {
    const result = await sut.execute({ userId: 'missing-user-id' })

    expect(result.isLeft()).toBe(true)
  })
})