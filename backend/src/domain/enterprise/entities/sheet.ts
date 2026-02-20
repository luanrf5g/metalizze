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
  deletedAt?: Date | null
}

export class Sheet extends Entity<SheetProps> {
  get materialId() { return this.props.materialId }
  get clientId() { return this.props.clientId ?? null }
  get sku() { return this.props.sku }
  get width() { return this.props.width }
  get height() { return this.props.height }
  get thickness() { return this.props.thickness }
  get quantity() { return this.props.quantity }
  get type() { return this.props.type }
  get createdAt() { return this.props.createdAt }
  get updatedAt() { return this.props.updatedAt }
  get deletedAt() { return this.props.deletedAt }

  get isScrap() { return this.props.type === 'SCRAP' }

  set materialId(materialId: UniqueEntityId) {
    this.props.materialId = materialId
    this.touch()
  }

  set clientId(clientId: UniqueEntityId | null) {
    this.props.clientId = clientId
    this.touch()
  }

  set sku(sku: string) {
    this.props.sku = sku
    this.touch()
  }

  set width(width: number) {
    this.props.width = width
    this.touch()
  }

  set height(height: number) {
    this.props.height = height
    this.touch()
  }

  set thickness(thickness: number) {
    this.props.thickness = thickness
    this.touch()
  }

  set type(type: SheetType) {
    this.props.type = type
    this.touch()
  }

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

  public delete() {
    this.props.deletedAt = new Date()
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