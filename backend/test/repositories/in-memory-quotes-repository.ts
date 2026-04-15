import { QuotesRepository, FetchQuotesParams, FetchQuotesResult } from "@/domain/application/repositories/quotes-repository";
import { Quote } from "@/domain/enterprise/entities/quote";
import { QuoteItem } from "@/domain/enterprise/entities/quote-item";
import { QuoteItemService } from "@/domain/enterprise/entities/quote-item-service";
import { QuoteWithItems } from "@/domain/enterprise/value-objects/quote-with-items";
import { QuoteListEntry } from "@/domain/enterprise/value-objects/quote-list-entry";

export class InMemoryQuotesRepository implements QuotesRepository {
  public items: Quote[] = []
  public quoteItems: QuoteItem[] = []
  public quoteItemServices: QuoteItemService[] = []

  async create(quote: Quote) {
    this.items.push(quote)
  }

  async save(quote: Quote) {
    const index = this.items.findIndex((item) => item.id.equals(quote.id))
    this.items[index] = quote
  }

  async findById(id: string) {
    const quote = this.items.find((item) => item.id.toString() === id)
    return quote ?? null
  }

  async findByCode(code: string) {
    const quote = this.items.find((item) => item.code === code)
    return quote ?? null
  }

  async findWithItemsById(id: string) {
    const quote = this.items.find((item) => item.id.toString() === id)
    if (!quote) return null

    const items = this.quoteItems
      .filter((item) => item.quoteId.toString() === id)
      .sort((a, b) => a.partNumber - b.partNumber)
      .map((item) => ({
        item,
        services: this.quoteItemServices.filter(
          (s) => s.quoteItemId.toString() === item.id.toString(),
        ),
      }))

    return QuoteWithItems.create({ quote, items })
  }

  async countItemsByQuoteId(quoteId: string) {
    return this.quoteItems.filter((item) => item.quoteId.toString() === quoteId).length
  }

  async addItem(item: QuoteItem, services: QuoteItemService[]) {
    this.quoteItems.push(item)
    this.quoteItemServices.push(...services)
  }

  async findItemById(itemId: string) {
    const item = this.quoteItems.find((i) => i.id.toString() === itemId)
    return item ?? null
  }

  async saveItem(item: QuoteItem) {
    const index = this.quoteItems.findIndex((i) => i.id.equals(item.id))
    this.quoteItems[index] = item
  }

  async removeItem(itemId: string) {
    const index = this.quoteItems.findIndex((i) => i.id.toString() === itemId)
    if (index !== -1) this.quoteItems.splice(index, 1)
    this.quoteItemServices = this.quoteItemServices.filter(
      (s) => s.quoteItemId.toString() !== itemId,
    )
  }

  async replaceItemServices(itemId: string, services: QuoteItemService[]) {
    this.quoteItemServices = this.quoteItemServices.filter(
      (s) => s.quoteItemId.toString() !== itemId,
    )
    this.quoteItemServices.push(...services)
  }

  async fetchAll(params: FetchQuotesParams): Promise<FetchQuotesResult> {
    const {
      page,
      perPage = 20,
      sortBy = 'updatedAt',
      sortOrder = 'desc',
      clientId,
      createdById,
      status,
      code,
      from,
      to,
    } = params

    let filtered = this.items.filter((quote) => {
      if (clientId != null && quote.clientId?.toString() !== clientId) return false
      if (createdById != null && quote.createdById.toString() !== createdById) return false
      if (status != null && status.length > 0 && !status.includes(quote.status)) return false
      if (code != null && !quote.code.toLowerCase().includes(code.toLowerCase())) return false
      if (from != null && quote.createdAt < from) return false
      if (to != null && quote.createdAt > to) return false
      return true
    })

    filtered = filtered.sort((a, b) => {
      let aVal: number | string
      let bVal: number | string
      switch (sortBy) {
        case 'totalQuote':
          aVal = a.totalQuote
          bVal = b.totalQuote
          break
        case 'code':
          aVal = a.code
          bVal = b.code
          break
        case 'createdAt':
          aVal = a.createdAt.getTime()
          bVal = b.createdAt.getTime()
          break
        case 'updatedAt':
        default:
          aVal = (a.updatedAt ?? a.createdAt).getTime()
          bVal = (b.updatedAt ?? b.createdAt).getTime()
          break
      }
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      return sortOrder === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number)
    })

    const total = filtered.length
    const paginated = filtered.slice((page - 1) * perPage, page * perPage)

    return {
      quotes: paginated.map((quote) =>
        QuoteListEntry.create({
          quote,
          client: null,
          createdBy: { id: quote.createdById.toString(), name: 'Unknown' },
        }),
      ),
      total,
    }
  }
}
