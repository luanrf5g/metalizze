import { InMemoryClientsRepository } from "test/repositories/in-memory-clients-repository";
import { EditClientUseCase } from "./edit-client";
import { Client } from "@/domain/enterprise/entities/client";

let clientsRepository: InMemoryClientsRepository
let sut: EditClientUseCase

describe('Edit Client', () => {
  beforeEach(() => {
    clientsRepository = new InMemoryClientsRepository()
    sut = new EditClientUseCase(clientsRepository)
  })

  it('should be able to edit a client', async () => {
    const client = Client.create({
      name: 'John Doe',
      document: '123.456.789-00',
      phone: '81999999999',
      email: 'john.doe@example.com'
    })

    await clientsRepository.create(client)

    const result = await sut.execute({
      clientId: client.id.toString(),
      name: 'João Silva',
      email: 'joao.silva@example.com',
      phone: '81999999999'
    })

    expect(result.isRight()).toBe(true)
    expect(clientsRepository.items[0]).toMatchObject({
      name: 'João Silva',
      email: 'joao.silva@example.com',
      phone: '81999999999'
    })
  })
})