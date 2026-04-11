import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/logic/Either";
import { QuotesRepository } from "../repositories/quotes-repository";
import { Quote, QuoteStatus } from "@/domain/enterprise/entities/quote";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { InvalidQuoteStatusTransitionError } from "./errors/invalid-quote-status-transition-error";

interface TransitionQuoteStatusUseCaseRequest {
  quoteId: string
  toStatus: QuoteStatus
}

type TransitionQuoteStatusUseCaseResponse = Either<
  ResourceNotFoundError | InvalidQuoteStatusTransitionError,
  { quote: Quote }
>

// Valid transitions: from -> allowed tos
const ALLOWED_TRANSITIONS: Record<QuoteStatus, QuoteStatus[]> = {
  DRAFT: ['SENT', 'APPROVED', 'REJECTED'],
  SENT: ['APPROVED', 'REJECTED', 'DRAFT'],
  APPROVED: [],
  REJECTED: [],
  EXPIRED: [],
}

@Injectable()
export class TransitionQuoteStatusUseCase {
  constructor(private quotesRepository: QuotesRepository) { }

  async execute({
    quoteId,
    toStatus,
  }: TransitionQuoteStatusUseCaseRequest): Promise<TransitionQuoteStatusUseCaseResponse> {
    const quote = await this.quotesRepository.findById(quoteId)
    if (!quote) return left(new ResourceNotFoundError())

    const fromStatus = quote.status
    const allowed = ALLOWED_TRANSITIONS[fromStatus]

    if (!allowed.includes(toStatus)) {
      return left(new InvalidQuoteStatusTransitionError(fromStatus, toStatus))
    }

    // Special case: SENT -> DRAFT (modification requested)
    if (fromStatus === 'SENT' && toStatus === 'DRAFT') {
      quote.revision = quote.revision + 1
      // sentAt is intentionally preserved
    }

    // Set timestamps
    const now = new Date()
    if (toStatus === 'SENT') quote.sentAt = now
    if (toStatus === 'APPROVED') quote.approvedAt = now
    if (toStatus === 'REJECTED') quote.rejectedAt = now
    if (toStatus === 'EXPIRED') quote.expiredAt = now

    quote.status = toStatus

    await this.quotesRepository.save(quote)

    return right({ quote })
  }
}
