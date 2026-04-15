import { Injectable } from "@nestjs/common";
import { Either, right } from "@/core/logic/Either";
import { QuotesRepository, FetchQuotesParams } from "../repositories/quotes-repository";
import { QuoteListEntry } from "@/domain/enterprise/value-objects/quote-list-entry";

export interface FetchQuotesMeta {
  page: number
  perPage: number
  total: number
  totalPages: number
}

type FetchQuotesUseCaseResponse = Either<never, { quotes: QuoteListEntry[]; meta: FetchQuotesMeta }>

@Injectable()
export class FetchQuotesUseCase {
  constructor(private quotesRepository: QuotesRepository) { }

  async execute(params: FetchQuotesParams): Promise<FetchQuotesUseCaseResponse> {
    const perPage = params.perPage ?? 20
    const { quotes, total } = await this.quotesRepository.fetchAll({ ...params, perPage })
    const totalPages = total === 0 ? 1 : Math.ceil(total / perPage)
    return right({
      quotes,
      meta: {
        page: params.page,
        perPage,
        total,
        totalPages,
      },
    })
  }
}
