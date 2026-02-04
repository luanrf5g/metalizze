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
    expect(sheet.owner).toBeNull()
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

    sheet.decreaseStock(10)

    expect(sheet.quantity).toBe(0)
  })
})