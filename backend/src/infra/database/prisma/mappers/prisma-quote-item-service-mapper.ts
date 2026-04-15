import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { QuoteItemService } from "@/domain/enterprise/entities/quote-item-service";
import { Prisma, QuoteItemService as PrismaQuoteItemService } from "@prisma/client";

type PrismaQuoteItemServiceWithName = PrismaQuoteItemService & {
  service?: { name: string; unitLabel: string } | null
}

export class PrismaQuoteItemServiceMapper {
  static toDomain(raw: PrismaQuoteItemServiceWithName): QuoteItemService {
    return QuoteItemService.create(
      {
        quoteItemId: new UniqueEntityId(raw.quoteItemId),
        serviceId: new UniqueEntityId(raw.serviceId),
        quantity: raw.quantity,
        unitPrice: raw.unitPrice,
        totalPrice: raw.totalPrice,
        serviceName: raw.service?.name,
        unitLabel: raw.service?.unitLabel,
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toPrisma(service: QuoteItemService): Prisma.QuoteItemServiceUncheckedCreateInput {
    return {
      id: service.id.toString(),
      quoteItemId: service.quoteItemId.toString(),
      serviceId: service.serviceId.toString(),
      quantity: service.quantity,
      unitPrice: service.unitPrice,
      totalPrice: service.totalPrice,
    }
  }
}
