import { makeSheet } from 'test/factories/make-sheet'
import { InMemoryInventoryMovementsRepository } from 'test/repositories/in-memory-inventory-movements-repository'
import { InMemorySheetsRepository } from 'test/repositories/in-memory-sheets-repository'
import { RegisterInventoryMovementUseCase } from './register-inventory-movements'

let inventoryMovementsRepository: InMemoryInventoryMovementsRepository
let sheetsRepository: InMemorySheetsRepository
let sut: RegisterInventoryMovementUseCase

describe('Register Inventory Movement Use Case', () => {
  beforeEach(() => {
    inventoryMovementsRepository = new InMemoryInventoryMovementsRepository()
    sheetsRepository = new InMemorySheetsRepository()
    sut = new RegisterInventoryMovementUseCase(inventoryMovementsRepository, sheetsRepository)
  })

  it('should register an exit movement and reduce stock', async () => {
    const sheet = makeSheet({ quantity: 10 })
    await sheetsRepository.create(sheet)

    const result = await sut.execute({
      sheetId: sheet.id.toString(),
      type: 'EXIT',
      quantity: 3,
      description: 'Saída de teste',
    })

    expect(result.isRight()).toBe(true)
    expect(sheetsRepository.items[0].quantity).toBe(7)
    expect(inventoryMovementsRepository.items).toHaveLength(1)
  })

  it('should not register an exit movement when stock is insufficient', async () => {
    const sheet = makeSheet({ quantity: 2 })
    await sheetsRepository.create(sheet)

    const result = await sut.execute({
      sheetId: sheet.id.toString(),
      type: 'EXIT',
      quantity: 3,
      description: 'Saída de teste',
    })

    expect(result.isLeft()).toBe(true)
  })
})