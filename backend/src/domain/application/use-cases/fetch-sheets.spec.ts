import { InMemorySheetsRepository } from "test/repositories/in-memory-sheets-repository";
import { FetchSheetsUseCase } from "./fetch-sheets";
import { makeSheet } from "test/factories/make-sheet";
import { UniqueEntityId } from "@/core/entities/unique-entity-id";

let sheetsRepository: InMemorySheetsRepository
let sut: FetchSheetsUseCase

describe('Fetch Sheets Use Case', () => {
  beforeEach(() => {
    sheetsRepository = new InMemorySheetsRepository()
    sut = new FetchSheetsUseCase(sheetsRepository)
  })

  it('should be able to fetch sheets', async () => {
    await sheetsRepository.create(makeSheet({ createdAt: new Date(2026, 0, 20) }))
    await sheetsRepository.create(makeSheet({ createdAt: new Date(2026, 0, 15) }))
    await sheetsRepository.create(makeSheet({ createdAt: new Date(2026, 0, 23) }))

    const result = await sut.execute({ page: 1 })

    expect(result.value?.sheets).toEqual([
      expect.objectContaining({ createdAt: new Date(2026, 0, 23) }),
      expect.objectContaining({ createdAt: new Date(2026, 0, 20) }),
      expect.objectContaining({ createdAt: new Date(2026, 0, 15) })
    ])
  })

  it('should be able to filter the fetch sheets', async () => {
    const targetSheet = makeSheet({
      materialId: new UniqueEntityId('Material-Test'),
      clientId: new UniqueEntityId('Client-Test'),
      type: "STANDARD",
      createdAt: new Date(2026, 0, 15)
    })

    await sheetsRepository.create(targetSheet)
    await sheetsRepository.create(makeSheet({
      materialId: new UniqueEntityId('Outro-Material'),
      createdAt: new Date(2026, 0, 20)
    }))
    await sheetsRepository.create(makeSheet({
      clientId: new UniqueEntityId('Outro-Client'),
      createdAt: new Date(2026, 0, 23)
    }))

    const result = await sut.execute({
      page: 1,
      materialId: 'Material-Test',
      clientId: 'Client-Test',
      type: 'STANDARD'
    })

    expect(result.value?.sheets).toHaveLength(1)
    expect(result.value?.sheets).toEqual([
      expect.objectContaining({
        materialId: new UniqueEntityId('Material-Test'),
        clientId: new UniqueEntityId('Client-Test'),
        type: "STANDARD",
      })
    ])
  })

  it('should not be fetch deleted sheets', async () => {
    await sheetsRepository.create(makeSheet({
      deletedAt: new Date(2022, 0, 15)
    }))

    await sheetsRepository.create(makeSheet())
    await sheetsRepository.create(makeSheet())

    const result = await sut.execute({ page: 1 })

    expect(result.value?.sheets).toHaveLength(2)
  })
})