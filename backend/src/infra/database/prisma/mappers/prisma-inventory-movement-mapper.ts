import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { InventoryMovement } from "@/domain/enterprise/entities/inventory-movement";
import { Prisma, InventoryMovement as PrismaInventoryMovement } from "@prisma/client";

export class PrismaInventoryMovementMapper {
  static toDomain(raw: PrismaInventoryMovement): InventoryMovement {
    return InventoryMovement.create(
      {
        sheetId: new UniqueEntityId(raw.sheetId),
        type: raw.type,
        quantity: raw.quantity,
        description: raw.description,
        createdAt: raw.createdAt,
      },
      new UniqueEntityId(raw.id)
    )
  }

  static toPrisma(inventoryMovement: InventoryMovement): Prisma.InventoryMovementUncheckedCreateInput {
    return {
      id: inventoryMovement.id.toString(),
      sheetId: inventoryMovement.sheetId.toString(),
      type: inventoryMovement.type,
      quantity: inventoryMovement.quantity,
      description: inventoryMovement.description,
      createdAt: inventoryMovement.createdAt,
    }
  }
}