import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { Quote, QuoteStatus, DiscountType } from "@/domain/enterprise/entities/quote";
import { Prisma, Quote as PrismaQuote } from "@prisma/client";

export class PrismaQuoteMapper {
  static toDomain(raw: PrismaQuote): Quote {
    return Quote.create(
      {
        code: raw.code,
        status: raw.status as QuoteStatus,
        clientId: raw.clientId ? new UniqueEntityId(raw.clientId) : null,
        notes: raw.notes,
        validUntil: raw.validUntil,
        totalMaterial: raw.totalMaterial,
        totalCutting: raw.totalCutting,
        totalSetup: raw.totalSetup,
        totalServices: raw.totalServices,
        subtotalQuote: raw.subtotalQuote,
        discountType: raw.discountType as DiscountType | null,
        discountValue: raw.discountValue,
        discountAmount: raw.discountAmount,
        totalQuote: raw.totalQuote,
        revision: raw.revision,
        sentAt: raw.sentAt,
        approvedAt: raw.approvedAt,
        rejectedAt: raw.rejectedAt,
        expiredAt: raw.expiredAt,
        createdById: new UniqueEntityId(raw.createdById),
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toPrisma(quote: Quote): Prisma.QuoteUncheckedCreateInput {
    return {
      id: quote.id.toString(),
      code: quote.code,
      status: quote.status,
      clientId: quote.clientId?.toString() ?? null,
      notes: quote.notes,
      validUntil: quote.validUntil,
      totalMaterial: quote.totalMaterial,
      totalCutting: quote.totalCutting,
      totalSetup: quote.totalSetup,
      totalServices: quote.totalServices,
      subtotalQuote: quote.subtotalQuote,
      discountType: quote.discountType ?? null,
      discountValue: quote.discountValue,
      discountAmount: quote.discountAmount,
      totalQuote: quote.totalQuote,
      revision: quote.revision,
      sentAt: quote.sentAt,
      approvedAt: quote.approvedAt,
      rejectedAt: quote.rejectedAt,
      expiredAt: quote.expiredAt,
      createdById: quote.createdById.toString(),
      createdAt: quote.createdAt,
      updatedAt: quote.updatedAt,
    }
  }
}
