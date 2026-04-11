import { Injectable } from "@nestjs/common";
import { Either, right } from "@/core/logic/Either";
import { QuotesRepository, FetchQuotesParams } from "../repositories/quotes-repository";
import { Quote } from "@/domain/enterprise/entities/quote";

type FetchQuotesUseCaseResponse = Either<never, { quotes: Quote[] }>

@Injectable()
export class FetchQuotesUseCase {
  constructor(private quotesRepository: QuotesRepository) { }

  async execute(params: FetchQuotesParams): Promise<FetchQuotesUseCaseResponse> {
    const quotes = await this.quotesRepository.fetchAll(params)
    return right({ quotes })
  }
}
