import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/logic/Either";
import { QuotesRepository } from "../repositories/quotes-repository";
import { QuoteWithItems } from "@/domain/enterprise/value-objects/quote-with-items";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

interface GetQuoteByIdUseCaseRequest {
  quoteId: string
}

type GetQuoteByIdUseCaseResponse = Either<
  ResourceNotFoundError,
  { quoteWithItems: QuoteWithItems }
>

@Injectable()
export class GetQuoteByIdUseCase {
  constructor(private quotesRepository: QuotesRepository) { }

  async execute({
    quoteId,
  }: GetQuoteByIdUseCaseRequest): Promise<GetQuoteByIdUseCaseResponse> {
    const quoteWithItems = await this.quotesRepository.findWithItemsById(quoteId)

    if (!quoteWithItems) {
      return left(new ResourceNotFoundError())
    }

    return right({ quoteWithItems })
  }
}
