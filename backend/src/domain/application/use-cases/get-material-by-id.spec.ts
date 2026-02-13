import { InMemoryMaterialsRepository } from "test/repositories/in-memory-materials-repository";
import { GetMaterialByIdUseCase } from "./get-material-by-id";
import { makeMaterial } from "test/factories/make-material";

let materialsRepository: InMemoryMaterialsRepository
let sut: GetMaterialByIdUseCase

describe('Get Material By Id Use Case', () => {
  beforeEach(() => {
    materialsRepository = new InMemoryMaterialsRepository()
    sut = new GetMaterialByIdUseCase(materialsRepository)
  })

  it('should be able to get material by id', async () => {
    const material = makeMaterial()

    await materialsRepository.create(material)

    const response = await sut.execute({
      id: material.id.toString()
    })

    expect(response.isRight()).toBeTruthy()
    expect(response.value).toEqual({
      material: materialsRepository.items[0]
    })
  })
})