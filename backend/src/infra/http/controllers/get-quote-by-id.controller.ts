import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
} from '@nestjs/common'
import { GetQuoteByIdUseCase } from '@/domain/application/use-cases/get-quote-by-id'
import { ResourceNotFoundError } from '@/domain/application/use-cases/errors/resource-not-found-error'
import { QuotePresenter } from '../presenters/quote-presenter'

@Controller('/quotes/:id')
export class GetQuoteByIdController {
  constructor(private getQuoteById: GetQuoteByIdUseCase) { }

  @Get()
  async handle(@Param('id') quoteId: string) {
    const result = await this.getQuoteById.execute({ quoteId })

    if (result.isLeft()) {
      const error = result.value
      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    return {
      quote: QuotePresenter.toHTTPWithItems(result.value.quoteWithItems),
    }
  }
}
