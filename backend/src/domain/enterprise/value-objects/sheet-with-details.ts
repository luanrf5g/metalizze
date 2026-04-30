import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { SheetType } from "../entities/sheet";

export interface SheetWithDetailsProps {
  id: UniqueEntityId,
  sku: string,
  materialId: UniqueEntityId,
  material: {
    id: UniqueEntityId,
    name: string,
    slug: string
  },
  width: number,
  height: number,
  thickness: number,
  quantity: number,
  price: number,
  type: SheetType,
  createdAt: Date,
  client?: {
    id: UniqueEntityId,
    name: string,
    document: string
  } | null
}

export class SheetWithDetails {
  private props: SheetWithDetailsProps

  constructor(props: SheetWithDetailsProps) {
    this.props = props
  }

  get id() { return this.props.id }
  get sku() { return this.props.sku }
  get materialId() { return this.props.materialId }
  get material() { return this.props.material }
  get width() { return this.props.width }
  get height() { return this.props.height }
  get thickness() { return this.props.thickness }
  get quantity() { return this.props.quantity }
  get price() { return this.props.price }
  get type() { return this.props.type }
  get createdAt() { return this.props.createdAt }
  get client() { return this.props.client }

  static create(props: SheetWithDetailsProps) {
    return new SheetWithDetails(props)
  }
}