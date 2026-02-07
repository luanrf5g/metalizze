import { InventoryMovementsRepository } from "@/domain/application/repositories/inventoryMovementsRepository";
import { InventoryMovement } from "@/domain/enterprise/entities/inventory-movement";

export class InMemoryInventoryMovementsRepository implements InventoryMovementsRepository {
  public items: InventoryMovement[] = []

  async create(inventoryMovement: InventoryMovement) {
    this.items.push(inventoryMovement)
  }
}