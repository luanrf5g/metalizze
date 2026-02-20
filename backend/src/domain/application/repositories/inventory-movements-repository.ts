import { PaginationParams } from "@/core/repositories/pagination-params";
import { InventoryMovement } from "@/domain/enterprise/entities/inventory-movement";

export interface FindManyInventoryMovements extends PaginationParams {
  sheetId?: string
}

export abstract class InventoryMovementsRepository {
  abstract create(inventoryMovement: InventoryMovement): Promise<void>
  abstract findMany(params: FindManyInventoryMovements): Promise<InventoryMovement[]>
}