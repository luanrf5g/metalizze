import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/logic/Either";
import { QuotesRepository } from "../repositories/quotes-repository";
import { Quote } from "@/domain/enterprise/entities/quote";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

interface CalculateQuoteTotalsUseCaseRequest {
  quoteId: string
}

type CalculateQuoteTotalsUseCaseResponse = Either<
  ResourceNotFoundError,
  { quote: Quote }
>

@Injectable()
export class CalculateQuoteTotalsUseCase {
  constructor(private quotesRepository: QuotesRepository) { }

  async execute({
    quoteId,
  }: CalculateQuoteTotalsUseCaseRequest): Promise<CalculateQuoteTotalsUseCaseResponse> {
    const quoteWithItems = await this.quotesRepository.findWithItemsById(quoteId)

    if (!quoteWithItems) {
      return left(new ResourceNotFoundError())
    }

    const { quote, items } = quoteWithItems

    let totalMaterial = 0
    let totalCutting = 0
    let totalSetup = 0
    let totalServices = 0
    let subtotalQuote = 0

    for (const { item } of items) {
      totalMaterial += item.materialCharged
      totalCutting += item.cuttingCost
      totalSetup += item.setupCost
      totalServices += item.servicesCost
      subtotalQuote += item.subtotalItemCost
    }

    let discountAmount = 0
    if (quote.discountType === 'PERCENT' && quote.discountValue != null) {
      discountAmount = subtotalQuote * (quote.discountValue / 100)
    } else if (quote.discountType === 'AMOUNT' && quote.discountValue != null) {
      discountAmount = Math.min(quote.discountValue, subtotalQuote)
    }

    const totalQuote = subtotalQuote - discountAmount

    quote.totalMaterial = totalMaterial
    quote.totalCutting = totalCutting
    quote.totalSetup = totalSetup
    quote.totalServices = totalServices
    quote.subtotalQuote = subtotalQuote
    quote.discountAmount = discountAmount
    quote.totalQuote = totalQuote

    await this.quotesRepository.save(quote)

    return right({ quote })
  }
}
