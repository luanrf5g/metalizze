import { FindManyInventoryMovements, InventoryMovementsRepository } from "@/domain/application/repositories/inventory-movements-repository";
import { InventoryMovement } from "@/domain/enterprise/entities/inventory-movement";

export class InMemoryInventoryMovementsRepository implements InventoryMovementsRepository {
  public items: InventoryMovement[] = []

  async create(inventoryMovement: InventoryMovement) {
    this.items.push(inventoryMovement)
  }

  async findMany({ page, sheetId }: FindManyInventoryMovements) {
    const movements = this.items.filter((item) => {
      if (sheetId && item.sheetId.toString() !== sheetId) {
        return false
      }

      return true
    }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice((page - 1) * 20, page * 20)

    return movements
  }
}