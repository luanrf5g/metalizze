import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { ProfileType } from "../entities/profile";

export interface ProfileWithDetailsProps {
  id: UniqueEntityId
  sku: string
  profileType: ProfileType
  width: number
  height: number
  length: number
  thickness: number
  materialId: UniqueEntityId
  material: {
    id: UniqueEntityId
    name: string
    slug: string
  }
  quantity: number
  price: number
  createdAt: Date
  client?: {
    id: UniqueEntityId
    name: string
    document: string
  } | null
}

export class ProfileWithDetails {
  private props: ProfileWithDetailsProps

  constructor(props: ProfileWithDetailsProps) {
    this.props = props
  }

  get id() { return this.props.id }
  get sku() { return this.props.sku }
  get profileType() { return this.props.profileType }
  get width() { return this.props.width }
  get height() { return this.props.height }
  get length() { return this.props.length }
  get thickness() { return this.props.thickness }
  get materialId() { return this.props.materialId }
  get material() { return this.props.material }
  get quantity() { return this.props.quantity }
  get price() { return this.props.price }
  get createdAt() { return this.props.createdAt }
  get client() { return this.props.client }

  static create(props: ProfileWithDetailsProps) {
    return new ProfileWithDetails(props)
  }
}
