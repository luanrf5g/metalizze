import { UniqueEntityId } from "@/core/entities/unique-entity-id"
import { Sheet } from "./sheet"

describe('Sheet Entity', () => {
  it('should be able to create a new sheet with zero stock by default', () => {
    const sheet = Sheet.create({
      materialId: new UniqueEntityId(),
      sku: 'ACO-2.00-2000x1000',
      width: 2000,
      height: 1000,
      thickness: 2
    })

    expect(sheet).toBeTruthy()
    expect(sheet.quantity).toBe(0)
    expect(sheet.clientId).toBeNull()
  })

  it('should be able to create a sheet for a client', () => {
    const clientId = new UniqueEntityId()

    const sheet = Sheet.create({
      materialId: new UniqueEntityId(),
      clientId: clientId,
      sku: 'TEST-SKU',
      width: 1000,
      height: 1000,
      thickness: 1,
      quantity: 5
    })

    expect(sheet.clientId).toEqual(clientId)
  })

  it('should be able to increase stock', () => {
    const sheet = Sheet.create({
      materialId: new UniqueEntityId(),
      sku: 'TEST-SKU',
      width: 1000,
      height: 1000,
      thickness: 1,
      quantity: 5
    })

    sheet.increaseStock(10)

    expect(sheet.quantity).toBe(15)
    expect(sheet.updatedAt).toBeTruthy()
  })

  it('should not allow negative stock', () => {
    const sheet = Sheet.create({
      materialId: new UniqueEntityId(),
      sku: 'TEST-SKU',
      width: 1000,
      height: 1000,
      thickness: 1,
      quantity: 5
    })

    expect(() => {
      sheet.decreaseStock(10)
    }).toThrow('Stock cannot be negative')

    expect(sheet.quantity).toBe(5)
  })
})