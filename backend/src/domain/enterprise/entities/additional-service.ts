import { Entity } from "@/core/entities/entity";
import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

export type AdditionalServiceType = 'BENDING' | 'THREADING' | 'WELDING'

export interface AdditionalServiceProps {
  type: AdditionalServiceType
  name: string
  unitLabel: string
  pricePerUnit: number
  isActive: boolean
  createdAt: Date
  updatedAt?: Date | null
}

export class AdditionalService extends Entity<AdditionalServiceProps> {
  get type() { return this.props.type }
  get name() { return this.props.name }
  get unitLabel() { return this.props.unitLabel }
  get pricePerUnit() { return this.props.pricePerUnit }
  get isActive() { return this.props.isActive }
  get createdAt() { return this.props.createdAt }
  get updatedAt() { return this.props.updatedAt }

  set name(name: string) {
    this.props.name = name
    this.touch()
  }

  set unitLabel(unitLabel: string) {
    this.props.unitLabel = unitLabel
    this.touch()
  }

  set pricePerUnit(pricePerUnit: number) {
    this.props.pricePerUnit = pricePerUnit
    this.touch()
  }

  set isActive(isActive: boolean) {
    this.props.isActive = isActive
    this.touch()
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  static create(
    props: Optional<AdditionalServiceProps, 'isActive' | 'createdAt'>,
    id?: UniqueEntityId
  ) {
    const additionalService = new AdditionalService(
      {
        ...props,
        isActive: props.isActive ?? true,
        createdAt: props.createdAt ?? new Date()
      },
      id
    )
    return additionalService
  }
}
