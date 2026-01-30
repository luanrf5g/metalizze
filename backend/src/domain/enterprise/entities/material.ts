import { Entity } from "@/core/entities/entity";
import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

export interface MaterialProps {
  name: string,
  createdAt: Date
}

export class Material extends Entity<MaterialProps> {
  get name() {
    return this.props.name
  }

  get createdAt() {
    return this.props.createdAt
  }

  set name(name: string) {
    this.props.name = name
  }

  static create(
    props: Optional<MaterialProps, 'createdAt'>,
    id?: UniqueEntityId
  ) {
    const material = new Material(
      {
        ...props,
        createdAt: props.createdAt ?? new Date()
      },
      id
    )

    return material
  }
}