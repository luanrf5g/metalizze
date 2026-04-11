import {
  BadRequestException,
  ConflictException,
  Controller,
  Delete,
  NotFoundException,
  Param,
} from '@nestjs/common'
import { RemoveQuoteItemUseCase } from '@/domain/application/use-cases/remove-quote-item'
import { GetQuoteByIdUseCase } from '@/domain/application/use-cases/get-quote-by-id'
import { ResourceNotFoundError } from '@/domain/application/use-cases/errors/resource-not-found-error'
import { QuoteNotEditableError } from '@/domain/application/use-cases/errors/quote-not-editable-error'
import { QuotePresenter } from '../presenters/quote-presenter'

@Controller('/quotes/:id/items/:itemId')
export class DeleteQuoteItemController {
  constructor(
    private removeQuoteItem: RemoveQuoteItemUseCase,
    private getQuoteById: GetQuoteByIdUseCase,
  ) { }

  @Delete()
  async handle(
    @Param('id') quoteId: string,
    @Param('itemId') itemId: string,
  ) {
    const result = await this.removeQuoteItem.execute({ quoteId, itemId })

    if (result.isLeft()) {
      const error = result.value
      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        case QuoteNotEditableError:
          throw new ConflictException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    const withItems = await this.getQuoteById.execute({ quoteId })
    if (withItems.isLeft()) {
      throw new BadRequestException(withItems.value.message)
    }

    return {
      quote: QuotePresenter.toHTTPWithItems(withItems.value.quoteWithItems),
    }
  }
}
