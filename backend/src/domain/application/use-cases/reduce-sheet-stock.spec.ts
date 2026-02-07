import { InMemorySheetsRepository } from "test/repositories/in-memory-sheets-repository";
import { ReduceSheetStockUseCase } from "./reduce-sheet-stock";
import { makeSheet } from "test/factories/make-sheet";
import { InsufficientStockError } from "./errors/insufficient-stock-error";
import { InMemoryInventoryMovementsRepository } from "test/repositories/in-memory-inventory-movements-repository";

let inMemorySheetsRepository: InMemorySheetsRepository
let inMemoryInventoryMovementsRepository: InMemoryInventoryMovementsRepository
let sut: ReduceSheetStockUseCase

describe('Reduce Sheet Stock Use Case', () => {
  beforeEach(() => {
    inMemorySheetsRepository = new InMemorySheetsRepository()
    inMemoryInventoryMovementsRepository = new InMemoryInventoryMovementsRepository()

    sut = new ReduceSheetStockUseCase(inMemorySheetsRepository, inMemoryInventoryMovementsRepository)
  })

  it('should be able to reduce stock', async () => {
    const sheet = makeSheet({ quantity: 10 })
    inMemorySheetsRepository.create(sheet)

    const result = await sut.execute({
      sheetId: sheet.id.toString(),
      quantity: 3,
      description: 'test'
    })

    expect(result.isRight()).toBe(true)

    expect(inMemorySheetsRepository.items[0].quantity).toBe(7)
  })

  it('should not be able to reduce stock if insufficient', async () => {
    const sheet = makeSheet({ quantity: 5 })
    inMemorySheetsRepository.create(sheet)

    const result = await sut.execute({
      sheetId: sheet.id.toString(),
      quantity: 10
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InsufficientStockError)

    expect(inMemorySheetsRepository.items[0].quantity).toBe(5)
  })
})