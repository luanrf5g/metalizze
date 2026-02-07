import { Entity } from "@/core/entities/entity";
import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

export interface InventoryMovementProps {
  sheetId: UniqueEntityId
  type: 'ENTRY' | 'EXIT',
  quantity: number,
  description?: string | null,
  createdAt: Date
}

export class InventoryMovement extends Entity<InventoryMovementProps> {
  get sheetId() { return this.props.sheetId }
  get type() { return this.props.type }
  get quantity() { return this.props.quantity }
  get description() { return this.props.description }
  get createdAt() { return this.props.createdAt }

  static create(
    props: Optional<InventoryMovementProps, 'createdAt'>,
    id?: UniqueEntityId
  ) {
    const inventoryMovement = new InventoryMovement(
      {
        ...props,
        createdAt: props.createdAt ?? new Date()
      },
      id
    )

    return inventoryMovement
  }
}