import { InventoryMovement } from "@/domain/enterprise/entities/inventory-movement";

export class InventoryMovementPresenter {
  static toHTTP(movement: InventoryMovement) {
    return {
      id: movement.id.toString(),
      sheetId: movement.sheetId.toString(),
      type: movement.type,
      quantity: movement.quantity,
      description: movement.description,
      createdAt: movement.createdAt
    }
  }
}