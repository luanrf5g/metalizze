import { InventoryMovement } from "@/domain/enterprise/entities/inventory-movement";

export abstract class InventoryMovementsRepository {
  abstract create(inventoryMovement: InventoryMovement): Promise<void>
}