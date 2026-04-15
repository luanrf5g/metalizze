import { Quote } from "../entities/quote";
import { QuoteItem } from "../entities/quote-item";
import { QuoteItemService } from "../entities/quote-item-service";

export interface QuoteItemEntry {
  item: QuoteItem
  services: QuoteItemService[]
}

export interface QuoteWithItemsProps {
  quote: Quote
  items: QuoteItemEntry[]
  client?: { id: string; name: string } | null
  createdBy?: { id: string; name: string }
}

export class QuoteWithItems {
  private props: QuoteWithItemsProps

  constructor(props: QuoteWithItemsProps) {
    this.props = props
  }

  get quote() { return this.props.quote }
  get items() { return this.props.items }
  get client() { return this.props.client ?? null }
  get createdBy() { return this.props.createdBy ?? null }

  static create(props: QuoteWithItemsProps) {
    return new QuoteWithItems(props)
  }
}
