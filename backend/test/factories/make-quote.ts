import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { Quote, QuoteProps } from "@/domain/enterprise/entities/quote";
import { QuoteItem, QuoteItemProps } from "@/domain/enterprise/entities/quote-item";
import { QuoteItemService, QuoteItemServiceProps } from "@/domain/enterprise/entities/quote-item-service";
import { faker } from "@faker-js/faker";

export function makeQuote(
  override: Partial<QuoteProps> = {},
  id?: UniqueEntityId,
) {
  return Quote.create(
    {
      code: override.code ?? `ORC-2604-${faker.string.alphanumeric(5).toUpperCase()}-GEN`,
      createdById: override.createdById ?? new UniqueEntityId(),
      ...override,
    },
    id,
  )
}

export function makeQuoteItem(
  override: Partial<QuoteItemProps> = {},
  id?: UniqueEntityId,
) {
  return QuoteItem.create(
    {
      quoteId: override.quoteId ?? new UniqueEntityId(),
      partNumber: override.partNumber ?? 1,
      itemKind: override.itemKind ?? 'SHEET',
      materialName: override.materialName ?? faker.commerce.productMaterial(),
      thickness: override.thickness ?? 3,
      baseMaterialPrice: override.baseMaterialPrice ?? 100,
      cuttingGasId: override.cuttingGasId ?? new UniqueEntityId(),
      cuttingTimeMinutes: override.cuttingTimeMinutes ?? 30,
      ...override,
    },
    id,
  )
}

export function makeQuoteItemService(
  override: Partial<QuoteItemServiceProps> = {},
  id?: UniqueEntityId,
) {
  return QuoteItemService.create(
    {
      quoteItemId: override.quoteItemId ?? new UniqueEntityId(),
      serviceId: override.serviceId ?? new UniqueEntityId(),
      quantity: override.quantity ?? 1,
      unitPrice: override.unitPrice ?? 50,
      totalPrice: override.totalPrice ?? 50,
      ...override,
    },
    id,
  )
}
