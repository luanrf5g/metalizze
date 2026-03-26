import { InventoryMovement } from "@/domain/enterprise/entities/inventory-movement";

export class InventoryMovementPresenter {
  static toHTTP(movement: InventoryMovement) {
    return {
      id: movement.id.toString(),
      sheetId: movement.sheetId?.toString() ?? null,
      profileId: movement.profileId?.toString() ?? null,
      type: movement.type,
      quantity: movement.quantity,
      description: movement.description,
      createdAt: movement.createdAt
    }
  }
}