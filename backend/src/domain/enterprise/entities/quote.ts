import { Entity } from "@/core/entities/entity";
import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";

export type QuoteStatus = 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED' | 'EXPIRED'
export type DiscountType = 'PERCENT' | 'AMOUNT'

export interface QuoteProps {
  code: string
  status: QuoteStatus
  clientId?: UniqueEntityId | null
  notes?: string | null
  validUntil?: Date | null
  totalMaterial: number
  totalCutting: number
  totalSetup: number
  totalServices: number
  subtotalQuote: number
  discountType?: DiscountType | null
  discountValue?: number | null
  discountAmount: number
  totalQuote: number
  revision: number
  sentAt?: Date | null
  approvedAt?: Date | null
  rejectedAt?: Date | null
  expiredAt?: Date | null
  createdById: UniqueEntityId
  createdAt: Date
  updatedAt?: Date | null
}

export class Quote extends Entity<QuoteProps> {
  get code() { return this.props.code }
  get status() { return this.props.status }
  get clientId() { return this.props.clientId ?? null }
  get notes() { return this.props.notes ?? null }
  get validUntil() { return this.props.validUntil ?? null }
  get totalMaterial() { return this.props.totalMaterial }
  get totalCutting() { return this.props.totalCutting }
  get totalSetup() { return this.props.totalSetup }
  get totalServices() { return this.props.totalServices }
  get subtotalQuote() { return this.props.subtotalQuote }
  get discountType() { return this.props.discountType ?? null }
  get discountValue() { return this.props.discountValue ?? null }
  get discountAmount() { return this.props.discountAmount }
  get totalQuote() { return this.props.totalQuote }
  get revision() { return this.props.revision }
  get sentAt() { return this.props.sentAt ?? null }
  get approvedAt() { return this.props.approvedAt ?? null }
  get rejectedAt() { return this.props.rejectedAt ?? null }
  get expiredAt() { return this.props.expiredAt ?? null }
  get createdById() { return this.props.createdById }
  get createdAt() { return this.props.createdAt }
  get updatedAt() { return this.props.updatedAt }

  set status(v: QuoteStatus) { this.props.status = v; this.touch() }
  set notes(v: string | null) { this.props.notes = v; this.touch() }
  set validUntil(v: Date | null) { this.props.validUntil = v; this.touch() }
  set totalMaterial(v: number) { this.props.totalMaterial = v; this.touch() }
  set totalCutting(v: number) { this.props.totalCutting = v; this.touch() }
  set totalSetup(v: number) { this.props.totalSetup = v; this.touch() }
  set totalServices(v: number) { this.props.totalServices = v; this.touch() }
  set subtotalQuote(v: number) { this.props.subtotalQuote = v; this.touch() }
  set discountType(v: DiscountType | null) { this.props.discountType = v; this.touch() }
  set discountValue(v: number | null) { this.props.discountValue = v; this.touch() }
  set discountAmount(v: number) { this.props.discountAmount = v; this.touch() }
  set totalQuote(v: number) { this.props.totalQuote = v; this.touch() }
  set revision(v: number) { this.props.revision = v; this.touch() }
  set sentAt(v: Date | null) { this.props.sentAt = v; this.touch() }
  set approvedAt(v: Date | null) { this.props.approvedAt = v; this.touch() }
  set rejectedAt(v: Date | null) { this.props.rejectedAt = v; this.touch() }
  set expiredAt(v: Date | null) { this.props.expiredAt = v; this.touch() }
  set clientId(v: UniqueEntityId | null) { this.props.clientId = v; this.touch() }

  private touch() { this.props.updatedAt = new Date() }

  static create(
    props: Optional<
      QuoteProps,
      | 'createdAt'
      | 'status'
      | 'totalMaterial'
      | 'totalCutting'
      | 'totalSetup'
      | 'totalServices'
      | 'subtotalQuote'
      | 'discountAmount'
      | 'totalQuote'
      | 'revision'
    >,
    id?: UniqueEntityId
  ) {
    return new Quote(
      {
        ...props,
        status: props.status ?? 'DRAFT',
        totalMaterial: props.totalMaterial ?? 0,
        totalCutting: props.totalCutting ?? 0,
        totalSetup: props.totalSetup ?? 0,
        totalServices: props.totalServices ?? 0,
        subtotalQuote: props.subtotalQuote ?? 0,
        discountAmount: props.discountAmount ?? 0,
        totalQuote: props.totalQuote ?? 0,
        revision: props.revision ?? 1,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )
  }
}
