import { InMemoryClientsRepository } from "test/repositories/in-memory-clients-repository";
import { RegisterClientUseCase } from "./register-client";
import { ClientAlreadyExistsError } from "./errors/client-already-exists";

let inMemoryClientsRepository: InMemoryClientsRepository
let sut: RegisterClientUseCase

describe('Register Client Use Case', () => {
  beforeEach(() => {
    inMemoryClientsRepository = new InMemoryClientsRepository()
    sut = new RegisterClientUseCase(inMemoryClientsRepository)
  })

  it('should be able to register a new client', async () => {
    const result = await sut.execute({
      name: 'João Silva',
      document: '123.456.789-00',
      email: 'joao@gmail.com',
      phone: '11999999999'
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({
      client: inMemoryClientsRepository.items[0]
    })
    expect(inMemoryClientsRepository.items[0].document).toEqual('123.456.789-00')
  })

  it('should not be able to register a client with same document', async () => {
    const document = '123.456.789-00'

    await sut.execute({
      name: 'João Silva',
      document,
      email: 'joao@gmail.com'
    })

    const result = await sut.execute({
      name: 'Maria Oliveira',
      document,
      email: 'maria@gmail.com'
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ClientAlreadyExistsError)
    expect(inMemoryClientsRepository.items).toHaveLength(1)
  })
})