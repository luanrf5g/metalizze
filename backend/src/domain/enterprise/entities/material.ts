import { Entity } from "@/core/entities/entity";
import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";
import { Slug } from "../value-objects/slug";

export interface MaterialProps {
  name: string,
  slug: Slug,
  createdAt: Date,
  updatedAt?: Date | null
}

export class Material extends Entity<MaterialProps> {
  get name() { return this.props.name }
  get slug() { return this.props.slug }
  get createdAt() { return this.props.createdAt }
  get updatedAt() { return this.props.updatedAt }

  set name(name: string) {
    this.props.name = name
    this.props.slug = Slug.createFromText(name)
    this.touch()
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  static create(
    props: Optional<MaterialProps, 'createdAt' | 'slug'>,
    id?: UniqueEntityId
  ) {
    const material = new Material(
      {
        ...props,
        slug: props.slug ?? Slug.createFromText(props.name),
        createdAt: props.createdAt ?? new Date()
      },
      id
    )

    return material
  }
}