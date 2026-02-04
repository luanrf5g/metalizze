import { InMemoryMaterialsRepository } from "test/repositories/in-memory-materials-repository";
import { InMemorySheetsRepository } from "test/repositories/in-memory-sheets-repository";
import { RegisterSheetUseCase } from "./register-sheet";
import { makeMaterial } from "test/factories/make-material";

let inMemorySheetsRepository: InMemorySheetsRepository
let inMemoryMaterialsRepository: InMemoryMaterialsRepository
let sut: RegisterSheetUseCase

describe('Register Sheet Use Case', () => {
  beforeEach(() => {
    inMemoryMaterialsRepository = new InMemoryMaterialsRepository()
    inMemorySheetsRepository = new InMemorySheetsRepository()
    sut = new RegisterSheetUseCase(
      inMemorySheetsRepository,
      inMemoryMaterialsRepository
    )
  })

  it('should be able to register a new sheet', async () => {
    const material = makeMaterial({ name: 'Aço Carbono' })
    inMemoryMaterialsRepository.create(material)

    const result = await sut.execute({
      materialId: material.id.toString(),
      width: 2000,
      height: 1000,
      thickness: 2,
      quantity: 10
    })

    expect(result.isRight()).toBe(true)

    if (result.isRight()) {
      expect(result.value.sheet.sku).toEqual('ACO-CARBONO-2.00-2000X1000')
      expect(inMemorySheetsRepository.items[0].quantity).toBe(10)
    }
  })

  it('should increase stock if sheet already exists', async () => {
    const material = makeMaterial()
    inMemoryMaterialsRepository.create(material)

    const sheet = {
      materialId: material.id.toString(),
      width: 2000,
      height: 1000,
      thickness: 2,
      quantity: 10,
    }

    await sut.execute(sheet)

    const result = await sut.execute({
      ...sheet,
      quantity: 5,
    })

    expect(result.isRight()).toBe(true)
    expect(inMemorySheetsRepository.items).toHaveLength(1)
    expect(inMemorySheetsRepository.items[0].quantity).toBe(15)
  })

  it('should generate correct SKU for owner sheets', async () => {
    const material = makeMaterial({ name: 'Inox' })
    inMemoryMaterialsRepository.create(material)

    const result = await sut.execute({
      materialId: material.id.toString(),
      width: 3000,
      height: 1200,
      thickness: 1.5,
      quantity: 1,
      owner: 'João Silva'
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.sheet.sku).toEqual('INOX-1.50-3000X1200-C:JOAOSILVA')
    }
  })
})