import { InMemoryMaterialsRepository } from "test/repositories/in-memory-materials-repository";
import { FetchMaterialsUseCase } from "./fetch-materials";
import { makeMaterial } from "test/factories/make-material";

let materialsRepository: InMemoryMaterialsRepository
let sut: FetchMaterialsUseCase

describe('Fetch Materials Use Case', () => {
  beforeEach(() => {
    materialsRepository = new InMemoryMaterialsRepository()
    sut = new FetchMaterialsUseCase(materialsRepository)
  })

  it('should be able to fetch materials', async () => {
    await materialsRepository.create(
      makeMaterial({ createdAt: new Date(2022, 0, 20) })
    )
    await materialsRepository.create(
      makeMaterial({ createdAt: new Date(2022, 0, 18) })
    )
    await materialsRepository.create(
      makeMaterial({ createdAt: new Date(2022, 0, 23) })
    )

    const result = await sut.execute({ page: 1 })

    expect(result.value?.materials).toEqual([
      expect.objectContaining({ createdAt: new Date(2022, 0, 23) }),
      expect.objectContaining({ createdAt: new Date(2022, 0, 20) }),
      expect.objectContaining({ createdAt: new Date(2022, 0, 18) })
    ])
  })

  it('should be able to fetch paginated materials', async () => {
    for (let i = 1; i <= 12; i++) {
      await materialsRepository.create(makeMaterial())
    }

    const result = await sut.execute({ page: 2 })

    expect(result.value?.materials).toHaveLength(2)
  })
})