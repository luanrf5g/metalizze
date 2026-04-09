import { Entity } from "@/core/entities/entity";
import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

export interface CuttingGasProps {
  name: string,
  pricePerHour: number,
  isActive: boolean,
  createdAt: Date,
  updatedAt?: Date | null
}

export class CuttingGas extends Entity<CuttingGasProps> {
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
    props: Optional<CuttingGasProps, 'isActive' | 'createdAt'>,
    id?: UniqueEntityId
  ) {
    const cuttingGas = new CuttingGas(
      {
        ...props,
        isActive: props.isActive ?? true,
        createdAt: props.createdAt ?? new Date()
      },
      id
    )
    return cuttingGas
  }
}