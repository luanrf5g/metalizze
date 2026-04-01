import { Entity } from "@/core/entities/entity";
import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

export interface InventoryMovementProps {
  sheetId?: UniqueEntityId | null
  profileId?: UniqueEntityId | null
  type: 'ENTRY' | 'EXIT',
  quantity: number,
  description?: string | null,
  createdAt: Date
}

export class InventoryMovement extends Entity<InventoryMovementProps> {
  get sheetId() { return this.props.sheetId ?? null }
  get profileId() { return this.props.profileId ?? null }
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
        sheetId: props.sheetId ?? null,
        profileId: props.profileId ?? null,
        createdAt: props.createdAt ?? new Date()
      },
      id
    )

    return inventoryMovement
  }
}