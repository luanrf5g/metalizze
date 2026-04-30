import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/logic/Either";
import { QuotesRepository } from "../repositories/quotes-repository";
import { ClientsRepository } from "../repositories/clients-repository";
import { Quote, DiscountType, QuoteType } from "@/domain/enterprise/entities/quote";
import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { QuoteNotEditableError } from "./errors/quote-not-editable-error";
import { CalculateQuoteTotalsUseCase } from "./calculate-quote-totals";

interface UpdateQuoteUseCaseRequest {
  quoteId: string
  clientId?: string | null
  notes?: string | null
  validUntil?: Date | null
  discountType?: DiscountType | null
  discountValue?: number | null
  quoteType?: QuoteType
  saleMarkupType?: DiscountType | null
  saleMarkupValue?: number | null
}

type UpdateQuoteUseCaseResponse = Either<
  ResourceNotFoundError | QuoteNotEditableError,
  { quote: Quote }
>

@Injectable()
export class UpdateQuoteUseCase {
  constructor(
    private quotesRepository: QuotesRepository,
    private clientsRepository: ClientsRepository,
    private calculateQuoteTotals: CalculateQuoteTotalsUseCase,
  ) { }

  async execute({
    quoteId,
    clientId,
    notes,
    validUntil,
    discountType,
    discountValue,
    quoteType,
    saleMarkupType,
    saleMarkupValue,
  }: UpdateQuoteUseCaseRequest): Promise<UpdateQuoteUseCaseResponse> {
    const quote = await this.quotesRepository.findById(quoteId)
    if (!quote) return left(new ResourceNotFoundError())

    if (quote.status !== 'DRAFT') {
      return left(new QuoteNotEditableError(quote.status))
    }

    // clientId field: undefined means "don't touch"; null means "clear"
    if (clientId !== undefined) {
      if (clientId === null) {
        quote.clientId = null
      } else {
        const client = await this.clientsRepository.findById(clientId)
        if (!client) return left(new ResourceNotFoundError())
        quote.clientId = new UniqueEntityId(clientId)
      }
    }

    if (notes !== undefined) quote.notes = notes ?? null
    if (validUntil !== undefined) quote.validUntil = validUntil ?? null
    if (discountType !== undefined) quote.discountType = discountType ?? null
    if (discountValue !== undefined) quote.discountValue = discountValue ?? null
    if (quoteType !== undefined) {
      quote.quoteType = quoteType
      // If switching to CUTTING, clear markup fields
      if (quoteType === 'CUTTING') {
        quote.saleMarkupType = null
        quote.saleMarkupValue = null
      }
    }
    if (saleMarkupType !== undefined) quote.saleMarkupType = saleMarkupType ?? null
    if (saleMarkupValue !== undefined) quote.saleMarkupValue = saleMarkupValue ?? null

    await this.quotesRepository.save(quote)
    await this.calculateQuoteTotals.execute({ quoteId })

    const updated = await this.quotesRepository.findById(quoteId)
    return right({ quote: updated! })
  }
}
