import { InMemoryClientsRepository } from "test/repositories/in-memory-clients-repository";
import { InMemoryInventoryMovementsRepository } from "test/repositories/in-memory-inventory-movements-repository";
import { InMemoryMaterialsRepository } from "test/repositories/in-memory-materials-repository";
import { InMemorySheetsRepository } from "test/repositories/in-memory-sheets-repository";
import { RegisterSheetCutUseCase } from "./register-sheet-cut";
import { makeMaterial } from "test/factories/make-material";
import { makeSheet } from "test/factories/make-sheet";
import { InsufficientStockError } from "./errors/insufficient-stock-error";
import { makeClient } from "test/factories/make-client";

let sheetsRepository: InMemorySheetsRepository
let inventoryMovementsRepository: InMemoryInventoryMovementsRepository
let materialsRepository: InMemoryMaterialsRepository
let clientsRepository: InMemoryClientsRepository
let sut: RegisterSheetCutUseCase

describe('Register Sheet Cut Use Case', () => {
  beforeEach(() => {
    sheetsRepository = new InMemorySheetsRepository()
    inventoryMovementsRepository = new InMemoryInventoryMovementsRepository()
    materialsRepository = new InMemoryMaterialsRepository()
    clientsRepository = new InMemoryClientsRepository()

    sut = new RegisterSheetCutUseCase(
      sheetsRepository,
      inventoryMovementsRepository,
      materialsRepository,
      clientsRepository
    )
  })

  it('should be able to cut a sheet and generate a NEW scrap', async () => {
    const material = makeMaterial()
    await materialsRepository.create(material)

    const motherSheet = makeSheet({
      materialId: material.id,
      quantity: 5,
      width: 3000,
      height: 1200,
      thickness: 2
    })
    await sheetsRepository.create(motherSheet)

    const result = await sut.execute({
      sheetId: motherSheet.id.toString(),
      quantityToCut: 2,
      generatedScraps: [
        { width: 1000, height: 500, quantity: 2 }
      ]
    })

    // Verificação de Sucesso
    expect(result.isRight()).toBeTruthy()

    // Verificação da chapa mãe reduzir 2 de 5
    expect(motherSheet.quantity).toBe(3)

    // Verificação da criação da nova chapa para o retalho
    expect(sheetsRepository.items).toHaveLength(2)

    const scrapSheet = sheetsRepository.items.find(s => s.type === 'SCRAP')
    expect(scrapSheet).toBeTruthy()
    expect(scrapSheet?.quantity).toBe(2)
    expect(scrapSheet?.width).toBe(1000)
    expect(scrapSheet?.sku).toContain('SCRAP')

    // Verificação para os movimentos de auditoria
    expect(inventoryMovementsRepository.items).toHaveLength(2)
    expect(inventoryMovementsRepository.items[0].type).toBe('EXIT')
    expect(inventoryMovementsRepository.items[1].type).toBe('ENTRY')
  })

  it('should ADD quantity to and EXISTING scrap instead of creating a new one', async () => {
    const material = makeMaterial()
    await materialsRepository.create(material)

    const motherSheet = makeSheet({
      materialId: material.id,
      quantity: 10,
      thickness: 5
    })
    await sheetsRepository.create(motherSheet)

    const existingScrap = makeSheet({
      materialId: material.id,
      width: 800,
      height: 800,
      thickness: 5,
      type: 'SCRAP',
      quantity: 1,
    })
    await sheetsRepository.create(existingScrap)

    const result = await sut.execute({
      sheetId: motherSheet.id.toString(),
      quantityToCut: 1,
      generatedScraps: [
        { width: 800, height: 800, quantity: 3 }
      ]
    })

    expect(result.isRight()).toBeTruthy()

    // Não deve ter criado uma terceira chapa
    expect(sheetsRepository.items).toHaveLength(2)

    // A quantidade do retalho deve ter sido somado
    expect(existingScrap.quantity).toBe(4)
  })

  it('should not be able to cut more sheets then available in stock', async () => {
    const motherSheet = makeSheet({ quantity: 2 })
    await sheetsRepository.create(motherSheet)

    const result = await sut.execute({
      sheetId: motherSheet.id.toString(),
      quantityToCut: 5,
      generatedScraps: []
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(InsufficientStockError)
  })

  it('should be able to assign a custom description and a client to the scrap', async () => {
    const material = makeMaterial()
    await materialsRepository.create(material)

    const client = makeClient({ name: 'Acme Corp' })
    await clientsRepository.create(client)

    const motherSheet = makeSheet({
      materialId: material.id,
      quantity: 1,
      thickness: 3
    })
    await sheetsRepository.create(motherSheet)

    const customDescription = 'Corte para a obra da Acme Corp, Orçamento #1024'

    const result = await sut.execute({
      sheetId: motherSheet.id.toString(),
      quantityToCut: 1,
      description: customDescription,
      generatedScraps: [
        { width: 500, height: 500, quantity: 1, clientId: client.id.toString() }
      ]
    })

    expect(result.isRight()).toBeTruthy()

    const outMovement = inventoryMovementsRepository.items.find(m => m.type === 'EXIT')
    expect(outMovement?.description).toBe(customDescription)

    const scrapSheet = sheetsRepository.items.find(s => s.type === 'SCRAP')
    expect(scrapSheet?.clientId?.equals(client.id)).toBe(true)
  })
})