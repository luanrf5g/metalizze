import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/logic/Either";
import { QuotesRepository } from "../repositories/quotes-repository";
import { Quote } from "@/domain/enterprise/entities/quote";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { QuoteNotEditableError } from "./errors/quote-not-editable-error";
import { CalculateQuoteTotalsUseCase } from "./calculate-quote-totals";

interface RemoveQuoteItemUseCaseRequest {
  quoteId: string
  itemId: string
}

type RemoveQuoteItemUseCaseResponse = Either<
  ResourceNotFoundError | QuoteNotEditableError,
  { quote: Quote }
>

@Injectable()
export class RemoveQuoteItemUseCase {
  constructor(
    private quotesRepository: QuotesRepository,
    private calculateQuoteTotals: CalculateQuoteTotalsUseCase,
  ) { }

  async execute({
    quoteId,
    itemId,
  }: RemoveQuoteItemUseCaseRequest): Promise<RemoveQuoteItemUseCaseResponse> {
    const quote = await this.quotesRepository.findById(quoteId)
    if (!quote) return left(new ResourceNotFoundError())

    if (quote.status !== 'DRAFT') {
      return left(new QuoteNotEditableError(quote.status))
    }

    const item = await this.quotesRepository.findItemById(itemId)
    if (!item || item.quoteId.toString() !== quoteId) {
      return left(new ResourceNotFoundError())
    }

    await this.quotesRepository.removeItem(itemId)
    await this.calculateQuoteTotals.execute({ quoteId })

    const updated = await this.quotesRepository.findById(quoteId)
    return right({ quote: updated! })
  }
}
