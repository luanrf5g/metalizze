import { InMemoryClientsRepository } from "test/repositories/in-memory-clients-repository";
import { InMemoryMaterialsRepository } from "test/repositories/in-memory-materials-repository";
import { InMemorySheetsRepository } from "test/repositories/in-memory-sheets-repository";
import { EditSheetUseCase } from "./edit-sheet";
import { makeSheet } from "test/factories/make-sheet";
import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { makeMaterial } from "test/factories/make-material";

let sheetsRepository: InMemorySheetsRepository
let materialsRepository: InMemoryMaterialsRepository
let clientsRepository: InMemoryClientsRepository
let sut: EditSheetUseCase

describe('Edit Sheet Use Case', () => {
  beforeEach(() => {
    sheetsRepository = new InMemorySheetsRepository()
    materialsRepository = new InMemoryMaterialsRepository()
    clientsRepository = new InMemoryClientsRepository()
    sut = new EditSheetUseCase(
      sheetsRepository,
      materialsRepository,
      clientsRepository
    )
  })

  it('should be able to edit a sheet', async () => {
    const sheet = makeSheet({
      createdAt: new Date(2022, 0, 15),
      width: 1000
    })

    const sheetId = sheet.id.toString()

    await sheetsRepository.create(sheet)

    expect(sheetsRepository.items).toHaveLength(1)
    expect(sheetsRepository.items[0].width).toBe(1000)

    const material = makeMaterial({ name: 'Carbono' })
    await materialsRepository.create(material)
    const materialId = material.id.toString()

    const result = await sut.execute({
      sheetId,
      materialId: materialId.toString(),
      thickness: 2,
      height: 1000,
      width: 2000,
    })

    expect(result.isRight()).toBeTruthy()
    expect(sheetsRepository.items[0]).toMatchObject({
      props: {
        sku: 'CARBONO-2.00-2000X1000',
        materialId: material.id,
        thickness: 2,
        width: 2000,
        height: 1000
      }
    })
  })
})