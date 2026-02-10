import { InMemoryClientsRepository } from "test/repositories/in-memory-clients-repository";
import { FetchClientsUseCase } from "./fetch-clients";
import { makeClient } from "test/factories/make-client";

let clientsRepository: InMemoryClientsRepository
let sut: FetchClientsUseCase

describe('Fetch Clients Use Case', () => {
  beforeEach(() => {
    clientsRepository = new InMemoryClientsRepository()
    sut = new FetchClientsUseCase(clientsRepository)
  })

  it('should be able to fetch recent clients', async () => {
    await clientsRepository.create(
      makeClient({ createdAt: new Date(2022, 0, 20) })
    )

    await clientsRepository.create(
      makeClient({ createdAt: new Date(2022, 0, 18) })
    )

    await clientsRepository.create(
      makeClient({ createdAt: new Date(2022, 0, 23) })
    )

    const result = await sut.execute({
      page: 1
    })

    expect(result.value?.clients).toEqual([
      expect.objectContaining({ createdAt: new Date(2022, 0, 23) }),
      expect.objectContaining({ createdAt: new Date(2022, 0, 20) }),
      expect.objectContaining({ createdAt: new Date(2022, 0, 18) }),
    ])
  })

  it('should be able to fetch paginated recent clients', async () => {
    for (let i = 1; i <= 17; i++) {
      await clientsRepository.create(makeClient())
    }

    const result = await sut.execute({
      page: 2
    })

    expect(result.value?.clients).toHaveLength(2)
  })
})