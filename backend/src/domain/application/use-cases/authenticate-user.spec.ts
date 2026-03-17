import { JwtService } from '@nestjs/jwt'
import { hash } from 'bcryptjs'
import { makeUser } from 'test/factories/make-user'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { AuthenticateUserUseCase } from './authenticate-user'

let usersRepository: InMemoryUsersRepository
let jwtService: JwtService
let sut: AuthenticateUserUseCase

describe('Authenticate User Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    jwtService = {
      sign: vi.fn().mockReturnValue('signed-token'),
    } as unknown as JwtService
    sut = new AuthenticateUserUseCase(usersRepository, jwtService)
  })

  it('should authenticate an active user with valid credentials', async () => {
    const user = makeUser({
      email: 'admin@metalizze.com',
      password: await hash('123456', 8),
    })

    await usersRepository.create(user)

    const result = await sut.execute({
      email: 'admin@metalizze.com',
      password: '123456',
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({ accessToken: 'signed-token' })
  })

  it('should not authenticate an inactive user', async () => {
    const user = makeUser({
      email: 'inactive@metalizze.com',
      password: await hash('123456', 8),
      isActive: false,
    })

    await usersRepository.create(user)

    const result = await sut.execute({
      email: 'inactive@metalizze.com',
      password: '123456',
    })

    expect(result.isLeft()).toBe(true)
  })
})