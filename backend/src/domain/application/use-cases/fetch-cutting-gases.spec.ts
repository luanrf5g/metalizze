import { InMemoryCuttingGasRepository } from "test/repositories/in-memory-cutting-gas-repository"
import { FetchCuttingGasesUseCase } from "./fetch-cutting-gases"
import { makeCuttingGas } from "test/factories/make-cutting-gas"

let cuttingGasRepository: InMemoryCuttingGasRepository
let sut: FetchCuttingGasesUseCase

describe('Fetch Cutting Gases Use Case', () => {
  beforeEach(() => {
    cuttingGasRepository = new InMemoryCuttingGasRepository()
    sut = new FetchCuttingGasesUseCase(cuttingGasRepository)
  })

  it('should be able to fetch cutting gases', async () => {
    await cuttingGasRepository.create(
      makeCuttingGas({ createdAt: new Date(2026, 0, 20) })
    )
    await cuttingGasRepository.create(
      makeCuttingGas({ createdAt: new Date(2026, 0, 20) })
    )

    const response = await sut.execute({ includeInactive: true })

    expect(response.isRight()).toBe(true)
    expect(cuttingGasRepository.items).toHaveLength(2)
  })

  it('should be able to fetch only active cutting gases', async () => {
    await cuttingGasRepository.create(
      makeCuttingGas({ createdAt: new Date(2026, 0, 20), isActive: true })
    )
    await cuttingGasRepository.create(
      makeCuttingGas({ createdAt: new Date(2026, 0, 20), isActive: false })
    )

    const response = await sut.execute({ includeInactive: false })

    expect(response.isRight()).toBe(true)
    expect(response.value?.cuttingGases).toHaveLength(1)
    expect(response.value?.cuttingGases[0].isActive).toBe(true)
  })
})