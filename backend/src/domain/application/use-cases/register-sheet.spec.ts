import { InMemoryMaterialsRepository } from "test/repositories/in-memory-materials-repository";
import { InMemorySheetsRepository } from "test/repositories/in-memory-sheets-repository";
import { RegisterSheetUseCase } from "./register-sheet";
import { makeMaterial } from "test/factories/make-material";
import { InMemoryClientsRepository } from "test/repositories/in-memory-clients-repository";
import { makeClient } from "test/factories/make-client";
import { InMemoryInventoryMovementsRepository } from "test/repositories/in-memory-inventory-movements-repository";
import { InventoryMovement } from "@/domain/enterprise/entities/inventory-movement";

let inMemorySheetsRepository: InMemorySheetsRepository
let inMemoryMaterialsRepository: InMemoryMaterialsRepository
let inMemoryClientsRepository: InMemoryClientsRepository
let inMemoryInventoryMovementsRepository: InMemoryInventoryMovementsRepository
let sut: RegisterSheetUseCase

describe('Register Sheet Use Case', () => {
  beforeEach(() => {
    inMemoryMaterialsRepository = new InMemoryMaterialsRepository()
    inMemorySheetsRepository = new InMemorySheetsRepository()
    inMemoryClientsRepository = new InMemoryClientsRepository()
    inMemoryInventoryMovementsRepository = new InMemoryInventoryMovementsRepository()
    sut = new RegisterSheetUseCase(
      inMemorySheetsRepository,
      inMemoryMaterialsRepository,
      inMemoryClientsRepository,
      inMemoryInventoryMovementsRepository
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
      expect(inMemoryInventoryMovementsRepository.items).toHaveLength(1)
      expect(inMemoryInventoryMovementsRepository.items[0].type).toBe('ENTRY')
      expect(inMemoryInventoryMovementsRepository.items[0].quantity).toBe(10)
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

  it('should generate correct SKU for client sheets', async () => {
    const material = makeMaterial({ name: 'Inox' })
    inMemoryMaterialsRepository.create(material)

    const client = makeClient({ name: 'João Silva' })
    inMemoryClientsRepository.create(client)

    const result = await sut.execute({
      materialId: material.id.toString(),
      clientId: client.id.toString(),
      width: 3000,
      height: 1200,
      thickness: 1.5,
      quantity: 1,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.sheet.sku).toEqual('INOX-1.50-3000X1200-C:JOAOSILVA')
      expect(result.value.sheet.clientId).toEqual(client.id)
    }
  })
})