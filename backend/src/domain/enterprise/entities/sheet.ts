import { Entity } from "@/core/entities/entity";
import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

export type SheetType = 'STANDARD' | 'SCRAP'

export interface SheetProps {
  materialId: UniqueEntityId,
  clientId?: UniqueEntityId | null,
  sku: string,
  width: number,
  height: number,
  thickness: number,
  quantity: number,
  type: SheetType,
  createdAt: Date,
  updatedAt?: Date | null
}

export class Sheet extends Entity<SheetProps> {
  get materialId() { return this.props.materialId }
  get clientId() { return this.props.clientId }
  get sku() { return this.props.sku }
  get width() { return this.props.width }
  get height() { return this.props.height }
  get thickness() { return this.props.thickness }
  get quantity() { return this.props.quantity }
  get type() { return this.props.type }
  get createdAt() { return this.props.createdAt }
  get updatedAt() { return this.props.updatedAt }

  get isScrap() { return this.props.type === 'SCRAP' }

  increaseStock(amount: number) {
    this.props.quantity += amount
    this.touch()
  }

  decreaseStock(amount: number) {
    if (this.props.quantity - amount < 0) {
      throw new Error('Stock cannot be negative')
    }
    this.props.quantity -= amount
    this.touch()
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  static create(
    props: Optional<SheetProps, 'createdAt' | 'quantity' | 'clientId' | 'type'>,
    id?: UniqueEntityId
  ) {
    const sheet = new Sheet(
      {
        ...props,
        clientId: props.clientId ?? null,
        quantity: props.quantity ?? 0,
        type: props.type ?? 'STANDARD',
        createdAt: props.createdAt ?? new Date()
      },
      id
    )

    return sheet
  }
}