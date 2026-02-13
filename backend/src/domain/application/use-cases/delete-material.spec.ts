import { InMemoryMaterialsRepository } from "test/repositories/in-memory-materials-repository";
import { InMemorySheetsRepository } from "test/repositories/in-memory-sheets-repository";
import { DeleteMaterialUseCase } from "./delete-material";
import { makeMaterial } from "test/factories/make-material";
import { makeSheet } from "test/factories/make-sheet";
import { MaterialHasSheetsError } from "./errors/material-has-sheets-error";

let materialsRepository: InMemoryMaterialsRepository
let sheetsRepository: InMemorySheetsRepository
let sut: DeleteMaterialUseCase

describe('Delete Material Use Case', () => {
  beforeEach(() => {
    materialsRepository = new InMemoryMaterialsRepository()
    sheetsRepository = new InMemorySheetsRepository()
    sut = new DeleteMaterialUseCase(materialsRepository, sheetsRepository)
  })

  it('should be able to delete a material', async () => {
    const material = makeMaterial()
    await materialsRepository.create(material)

    const response = await sut.execute({
      id: material.id.toString()
    })

    expect(response.isRight()).toBeTruthy()
    expect(materialsRepository.items).toHaveLength(0)
  })

  it('should not be able to delete a material if he is linked to sheets', async () => {
    const material = makeMaterial()
    await materialsRepository.create(material)

    await sheetsRepository.create(makeSheet({ materialId: material.id }))

    const response = await sut.execute({
      id: material.id.toString()
    })

    expect(response.isLeft()).toBeTruthy()
    expect(response.value).toBeInstanceOf(MaterialHasSheetsError)
    expect(materialsRepository.items).toHaveLength(1)
  })
})