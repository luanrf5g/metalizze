import { Entity } from "@/core/entities/entity";
import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

export type ProfileType = 'SQUARE' | 'RECTANGULAR' | 'ROUND' | 'OBLONG' | 'ANGLE' | 'U_CHANNEL'

/**
 * Tipos com dimensões iguais (altura = largura):
 * - SQUARE (Quadrado)
 * - ROUND (Redondo)
 * - ANGLE (Cantoneira)
 *
 * Tipos com dimensões diferentes (altura ≠ largura):
 * - RECTANGULAR (Retangular)
 * - OBLONG (Oblongo)
 * - U_CHANNEL (Perfil U)
 */
export const EQUAL_DIMENSION_PROFILES: ProfileType[] = ['SQUARE', 'ROUND', 'ANGLE']

export function isEqualDimensionProfile(profileType: ProfileType): boolean {
  return EQUAL_DIMENSION_PROFILES.includes(profileType)
}

export interface ProfileProps {
  materialId: UniqueEntityId
  clientId?: UniqueEntityId | null
  sku: string
  profileType: ProfileType
  width: number
  height: number
  length: number
  thickness: number
  quantity: number
  price?: number | null
  storageLocation?: string | null
  createdAt: Date
  updatedAt?: Date | null
  deletedAt?: Date | null
}

export class Profile extends Entity<ProfileProps> {
  get materialId() { return this.props.materialId }
  get clientId() { return this.props.clientId ?? null }
  get sku() { return this.props.sku }
  get profileType() { return this.props.profileType }
  get width() { return this.props.width }
  get height() { return this.props.height }
  get length() { return this.props.length }
  get thickness() { return this.props.thickness }
  get quantity() { return this.props.quantity }
  get price() { return this.props.price ?? 0 }
  get storageLocation() { return this.props.storageLocation ?? null }
  get createdAt() { return this.props.createdAt }
  get updatedAt() { return this.props.updatedAt }
  get deletedAt() { return this.props.deletedAt }

  set materialId(v: UniqueEntityId) { this.props.materialId = v; this.touch() }
  set clientId(v: UniqueEntityId | null) { this.props.clientId = v; this.touch() }
  set sku(v: string) { this.props.sku = v; this.touch() }
  set profileType(v: ProfileType) { this.props.profileType = v; this.touch() }
  set width(v: number) { this.props.width = v; this.touch() }
  set height(v: number) { this.props.height = v; this.touch() }
  set length(v: number) { this.props.length = v; this.touch() }
  set thickness(v: number) { this.props.thickness = v; this.touch() }
  set price(v: number | null) { this.props.price = v; this.touch() }
  set storageLocation(v: string | null) { this.props.storageLocation = v; this.touch() }

  updatePrice(newPrice: number) {
    if (newPrice > (this.props.price ?? 0)) {
      this.props.price = newPrice
      this.touch()
    }
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

  /**
   * Para perfis com dimensões iguais (SQUARE, ROUND, ANGLE),
   * a altura é automaticamente igualada à largura.
   */
  static create(
    props: Optional<ProfileProps, 'createdAt' | 'quantity' | 'clientId' | 'price'>,
    id?: UniqueEntityId
  ) {
    const height = isEqualDimensionProfile(props.profileType)
      ? props.width
      : props.height

    return new Profile(
      {
        ...props,
        height,
        clientId: props.clientId ?? null,
        quantity: props.quantity ?? 0,
        price: props.price ?? 0,
        createdAt: props.createdAt ?? new Date()
      },
      id
    )
  }
}
