import { compare } from 'bcryptjs'
import { makeUser } from 'test/factories/make-user'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { EditUserUseCase } from './edit-user'

let usersRepository: InMemoryUsersRepository
let sut: EditUserUseCase

describe('Edit User Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new EditUserUseCase(usersRepository)
  })

  it('should edit a user and hash the new password', async () => {
    const user = makeUser({ password: 'old-password' })
    await usersRepository.create(user)

    const result = await sut.execute({
      userId: user.id.toString(),
      name: 'Novo Nome',
      password: '654321',
      isActive: false,
    })

    expect(result.isRight()).toBe(true)
    expect(result.value?.user.name).toBe('Novo Nome')
    expect(result.value?.user.isActive).toBe(false)
    expect(await compare('654321', result.value!.user.password)).toBe(true)
  })

  it('should return left when user does not exist', async () => {
    const result = await sut.execute({
      userId: 'missing-user-id',
      name: 'Novo Nome',
    })

    expect(result.isLeft()).toBe(true)
  })
})