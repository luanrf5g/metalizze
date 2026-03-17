import { makeUser } from 'test/factories/make-user'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { FetchUsersUseCase } from './fetch-users'

let usersRepository: InMemoryUsersRepository
let sut: FetchUsersUseCase

describe('Fetch Users Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new FetchUsersUseCase(usersRepository)
  })

  it('should fetch users ordered by creation date', async () => {
    await usersRepository.create(makeUser({ createdAt: new Date(2026, 0, 20) }))
    await usersRepository.create(makeUser({ createdAt: new Date(2026, 0, 18) }))
    await usersRepository.create(makeUser({ createdAt: new Date(2026, 0, 23) }))

    const result = await sut.execute({ page: 1 })

    expect(result.value?.users).toEqual([
      expect.objectContaining({ createdAt: new Date(2026, 0, 23) }),
      expect.objectContaining({ createdAt: new Date(2026, 0, 20) }),
      expect.objectContaining({ createdAt: new Date(2026, 0, 18) }),
    ])
  })
})