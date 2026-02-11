import { InMemoryClientsRepository } from "test/repositories/in-memory-clients-repository";
import { InMemorySheetsRepository } from "test/repositories/in-memory-sheets-repository";
import { DeleteClientUseCase } from "./delete-client";
import { makeClient } from "test/factories/make-client";
import { makeMaterial } from "test/factories/make-material";
import { makeSheet } from "test/factories/make-sheet";
import { ClientHasSheetsError } from "./errors/client-has-sheets-error";

let clientsRepository: InMemoryClientsRepository
let sheetsRepository: InMemorySheetsRepository
let sut: DeleteClientUseCase

describe('Delete Client Use Case', () => {
  beforeEach(() => {
    clientsRepository = new InMemoryClientsRepository()
    sheetsRepository = new InMemorySheetsRepository()
    sut = new DeleteClientUseCase(clientsRepository, sheetsRepository)
  })

  it('should be able to delete a client', async () => {
    const client = makeClient()
    await clientsRepository.create(client)

    const result = await sut.execute({
      clientId: client.id.toString()
    })

    expect(result.isRight()).toBe(true)
    expect(clientsRepository.items).toHaveLength(0)
  })

  it('should not be able to delete a client that has a sheet registered.', async () => {
    const client = makeClient()
    await clientsRepository.create(client)

    const material = makeMaterial()
    await sheetsRepository.create(makeSheet({
      clientId: client.id,
      materialId: material.id
    }))

    const result = await sut.execute({
      clientId: client.id.toString()
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ClientHasSheetsError)
    expect(clientsRepository.items).toHaveLength(1)
  })
})