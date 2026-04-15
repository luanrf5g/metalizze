import { Entity } from "@/core/entities/entity";
import { UniqueEntityId } from "@/core/entities/unique-entity-id";

export interface QuoteItemServiceProps {
  quoteItemId: UniqueEntityId
  serviceId: UniqueEntityId
  quantity: number
  unitPrice: number
  totalPrice: number
  serviceName?: string
  unitLabel?: string
}

export class QuoteItemService extends Entity<QuoteItemServiceProps> {
  get quoteItemId() { return this.props.quoteItemId }
  get serviceId() { return this.props.serviceId }
  get quantity() { return this.props.quantity }
  get unitPrice() { return this.props.unitPrice }
  get totalPrice() { return this.props.totalPrice }
  get serviceName() { return this.props.serviceName ?? null }
  get unitLabel() { return this.props.unitLabel ?? null }

  static create(props: QuoteItemServiceProps, id?: UniqueEntityId) {
    return new QuoteItemService(props, id)
  }
}
