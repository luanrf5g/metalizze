import { Injectable } from "@nestjs/common";
import { Either, right } from "@/core/logic/Either";
import { QuotesRepository, FetchQuotesParams } from "../repositories/quotes-repository";
import { QuoteListEntry } from "@/domain/enterprise/value-objects/quote-list-entry";

type FetchQuotesUseCaseResponse = Either<never, { quotes: QuoteListEntry[] }>

@Injectable()
export class FetchQuotesUseCase {
  constructor(private quotesRepository: QuotesRepository) { }

  async execute(params: FetchQuotesParams): Promise<FetchQuotesUseCaseResponse> {
    const quotes = await this.quotesRepository.fetchAll(params)
    return right({ quotes })
  }
}
