import { Entity } from "@/core/entities/entity";
import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

export interface ClientProps {
  name: string,
  document: string,
  phone?: string | null,
  email?: string | null,
  createdAt: Date,
  updatedAt?: Date | null
}

export class Client extends Entity<ClientProps> {
  get name() { return this.props.name }
  get document() { return this.props.document }
  get phone() { return this.props.phone }
  get email() { return this.props.email }
  get createdAt() { return this.props.createdAt }
  get updatedAt() { return this.props.updatedAt }

  private touch() {
    this.props.updatedAt = new Date()
  }

  set name(name: string) {
    this.props.name = name
    this.touch()
  }

  set phone(phone: string | undefined | null) {
    this.props.phone = phone
    this.touch()
  }

  set email(email: string | undefined | null) {
    this.props.email = email
    this.touch()
  }

  static create(
    props: Optional<ClientProps, 'createdAt'>,
    id?: UniqueEntityId
  ) {
    const client = new Client(
      {
        ...props,
        createdAt: props.createdAt ?? new Date()
      },
      id
    )

    return client
  }
}