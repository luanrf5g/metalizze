import { Quote } from '@/domain/enterprise/entities/quote'
import { QuoteWithItems } from '@/domain/enterprise/value-objects/quote-with-items'
import { QuoteListEntry } from '@/domain/enterprise/value-objects/quote-list-entry'
import { QuoteItemPresenter } from './quote-item-presenter'

export class QuotePresenter {
  static toHTTP(quote: Quote) {
    return {
      id: quote.id.toString(),
      code: quote.code,
      status: quote.status,
      revision: quote.revision,
      clientId: quote.clientId?.toString() ?? null,
      notes: quote.notes,
      validUntil: quote.validUntil,
      totalMaterial: quote.totalMaterial,
      totalCutting: quote.totalCutting,
      totalSetup: quote.totalSetup,
      totalServices: quote.totalServices,
      subtotalQuote: quote.subtotalQuote,
      discountType: quote.discountType,
      discountValue: quote.discountValue,
      discountAmount: quote.discountAmount,
      totalQuote: quote.totalQuote,
      sentAt: quote.sentAt,
      approvedAt: quote.approvedAt,
      rejectedAt: quote.rejectedAt,
      expiredAt: quote.expiredAt,
      createdById: quote.createdById.toString(),
      createdAt: quote.createdAt,
      updatedAt: quote.updatedAt,
    }
  }

  static toHTTPList(entry: QuoteListEntry) {
    return {
      ...QuotePresenter.toHTTP(entry.quote),
      client: entry.client,
      createdBy: entry.createdBy,
    }
  }

  static toHTTPWithItems(quoteWithItems: QuoteWithItems) {
    return {
      ...QuotePresenter.toHTTP(quoteWithItems.quote),
      client: quoteWithItems.client,
      createdBy: quoteWithItems.createdBy,
      items: quoteWithItems.items.map(({ item, services }) =>
        QuoteItemPresenter.toHTTP(item, services),
      ),
    }
  }
}
