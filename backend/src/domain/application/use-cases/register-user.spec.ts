import { compare } from 'bcryptjs'
import { makeUser } from 'test/factories/make-user'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { RegisterUserUseCase } from './register-user'

let usersRepository: InMemoryUsersRepository
let sut: RegisterUserUseCase

describe('Register User Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new RegisterUserUseCase(usersRepository)
  })

  it('should register a user with a hashed password', async () => {
    const result = await sut.execute({
      name: 'Admin Metalizze',
      email: 'admin@metalizze.com',
      password: '123456',
      role: 'ADMIN',
    })

    expect(result.isRight()).toBe(true)
    expect(usersRepository.items).toHaveLength(1)
    expect(await compare('123456', usersRepository.items[0].password)).toBe(true)
  })

  it('should not register a user with duplicated email', async () => {
    await usersRepository.create(makeUser({ email: 'admin@metalizze.com' }))

    const result = await sut.execute({
      name: 'Duplicate',
      email: 'admin@metalizze.com',
      password: '123456',
      role: 'ADMIN',
    })

    expect(result.isLeft()).toBe(true)
  })
})