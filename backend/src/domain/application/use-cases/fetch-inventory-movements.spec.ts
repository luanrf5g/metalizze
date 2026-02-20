import { InMemoryInventoryMovementsRepository } from "test/repositories/in-memory-inventory-movements-repository";
import { FetchInventoryMovementsUseCase } from "./fetch-inventory-movements";
import { makeInventoryMovement } from "test/factories/make-inventory-movement";
import { UniqueEntityId } from "@/core/entities/unique-entity-id";

let inventoryMovementsRepository: InMemoryInventoryMovementsRepository
let sut: FetchInventoryMovementsUseCase

describe('Fetch Inventory Movements Use Case', () => {
  beforeEach(() => {
    inventoryMovementsRepository = new InMemoryInventoryMovementsRepository()
    sut = new FetchInventoryMovementsUseCase(inventoryMovementsRepository)
  })

  it('should be able to fetch inventory movements ordered by creation date', async () => {
    await inventoryMovementsRepository.create(makeInventoryMovement({
      createdAt: new Date(2026, 0, 20)
    }))
    await inventoryMovementsRepository.create(makeInventoryMovement({
      createdAt: new Date(2026, 0, 25)
    }))
    await inventoryMovementsRepository.create(makeInventoryMovement({
      createdAt: new Date(2026, 0, 23)
    }))

    const result = await sut.execute({ page: 1 })

    expect(result.isRight()).toBeTruthy()
    expect(result.value?.movements).toEqual([
      expect.objectContaining({ createdAt: new Date(2026, 0, 25) }),
      expect.objectContaining({ createdAt: new Date(2026, 0, 23) }),
      expect.objectContaining({ createdAt: new Date(2026, 0, 20) })
    ])
  })

  it('should be able to filter inventory movements by sheetId', async () => {
    const targetSheetId = new UniqueEntityId('sheet-1')
    const noiseSheetId = new UniqueEntityId('sheet-2')

    await inventoryMovementsRepository.create(makeInventoryMovement({
      sheetId: targetSheetId,
      type: 'ENTRY',
      quantity: 10
    }))
    await inventoryMovementsRepository.create(makeInventoryMovement({
      sheetId: targetSheetId,
      type: 'EXIT',
      quantity: 2
    }))
    await inventoryMovementsRepository.create(makeInventoryMovement({
      sheetId: noiseSheetId,
      type: 'ENTRY',
      quantity: 5
    }))

    const result = await sut.execute({
      page: 1,
      sheetId: 'sheet-1'
    })

    expect(result.isRight()).toBeTruthy()
    expect(result.value?.movements).toHaveLength(2)

    expect(result.value?.movements).toEqual([
      expect.objectContaining({ sheetId: targetSheetId }),
      expect.objectContaining({ sheetId: targetSheetId }),
    ])
  })

  it('should be able to fetch paginated inventory movements', async () => {
    for (let i = 1; i <= 22; i++) {
      await inventoryMovementsRepository.create(makeInventoryMovement())
    }

    const result = await sut.execute({ page: 2 })

    expect(result.isRight()).toBeTruthy()
    expect(result.value?.movements).toHaveLength(2)
  })
})