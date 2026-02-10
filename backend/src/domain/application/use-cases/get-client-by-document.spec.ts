import { InMemoryClientsRepository } from "test/repositories/in-memory-clients-repository"
import { GetClientByDocumentUseCase } from "./get-client-by-document"
import { makeClient } from "test/factories/make-client"

let clientsRepository: InMemoryClientsRepository
let sut: GetClientByDocumentUseCase

describe('Get Client By Document', () => {
  beforeEach(() => {
    clientsRepository = new InMemoryClientsRepository()
    sut = new GetClientByDocumentUseCase(clientsRepository)
  })

  it('should be able to get a client by document', async () => {
    const client = makeClient({ document: '12345678901' })

    await clientsRepository.create(client)

    const result = await sut.execute({
      document: client.document
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({
      client: clientsRepository.items[0]
    })
  })
})