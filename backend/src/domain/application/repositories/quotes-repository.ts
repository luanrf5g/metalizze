import { Quote, QuoteStatus, QuoteType } from "@/domain/enterprise/entities/quote";
import { QuoteItem } from "@/domain/enterprise/entities/quote-item";
import { QuoteItemService } from "@/domain/enterprise/entities/quote-item-service";
import { QuoteWithItems } from "@/domain/enterprise/value-objects/quote-with-items";
import { QuoteListEntry } from "@/domain/enterprise/value-objects/quote-list-entry";

export type QuotesSortBy = 'createdAt' | 'updatedAt' | 'totalQuote' | 'code'
export type QuotesSortOrder = 'asc' | 'desc'

export interface FetchQuotesParams {
  page: number
  perPage?: number
  sortBy?: QuotesSortBy
  sortOrder?: QuotesSortOrder
  status?: QuoteStatus[] | null
  quoteType?: QuoteType | null
  clientId?: string | null
  createdById?: string | null
  code?: string | null
  from?: Date | null
  to?: Date | null
}

export interface FetchQuotesResult {
  quotes: QuoteListEntry[]
  total: number
}

export abstract class QuotesRepository {
  abstract create(quote: Quote): Promise<void>
  abstract save(quote: Quote): Promise<void>
  abstract findById(id: string): Promise<Quote | null>
  abstract findByCode(code: string): Promise<Quote | null>
  abstract findWithItemsById(id: string): Promise<QuoteWithItems | null>
  abstract countItemsByQuoteId(quoteId: string): Promise<number>
  abstract addItem(item: QuoteItem, services: QuoteItemService[]): Promise<void>
  abstract findItemById(itemId: string): Promise<QuoteItem | null>
  abstract saveItem(item: QuoteItem): Promise<void>
  abstract removeItem(itemId: string): Promise<void>
  abstract replaceItemServices(itemId: string, services: QuoteItemService[]): Promise<void>
  abstract fetchAll(params: FetchQuotesParams): Promise<FetchQuotesResult>
}
