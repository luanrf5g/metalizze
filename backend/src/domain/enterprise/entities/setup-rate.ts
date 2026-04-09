import { Entity } from "@/core/entities/entity";
import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

export interface SetupRateProps {
  name: string
  pricePerHour: number
  isActive: boolean
  createdAt: Date
  updatedAt?: Date | null
}

export class SetupRate extends Entity<SetupRateProps> {
  get name() { return this.props.name }
  get pricePerHour() { return this.props.pricePerHour }
  get isActive() { return this.props.isActive }
  get createdAt() { return this.props.createdAt }
  get updatedAt() { return this.props.updatedAt }

  set name(name: string) {
    this.props.name = name
    this.touch()
  }

  set pricePerHour(pricePerHour: number) {
    this.props.pricePerHour = pricePerHour
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
    props: Optional<SetupRateProps, 'isActive' | 'createdAt'>,
    id?: UniqueEntityId
  ) {
    const setupRate = new SetupRate(
      {
        ...props,
        isActive: props.isActive ?? true,
        createdAt: props.createdAt ?? new Date()
      },
      id
    )
    return setupRate
  }
}
