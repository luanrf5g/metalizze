import { Quote } from '../entities/quote'

export interface QuoteListEntryProps {
  quote: Quote
  client: { id: string; name: string } | null
  createdBy: { id: string; name: string }
}

export class QuoteListEntry {
  private props: QuoteListEntryProps

  constructor(props: QuoteListEntryProps) {
    this.props = props
  }

  get quote() { return this.props.quote }
  get client() { return this.props.client }
  get createdBy() { return this.props.createdBy }

  static create(props: QuoteListEntryProps) {
    return new QuoteListEntry(props)
  }
}
