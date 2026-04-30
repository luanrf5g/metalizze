import z from 'zod'
import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  NotFoundException,
  Param,
  Patch,
} from '@nestjs/common'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'
import { UpdateQuoteUseCase } from '@/domain/application/use-cases/update-quote'
import { GetQuoteByIdUseCase } from '@/domain/application/use-cases/get-quote-by-id'
import { ResourceNotFoundError } from '@/domain/application/use-cases/errors/resource-not-found-error'
import { QuoteNotEditableError } from '@/domain/application/use-cases/errors/quote-not-editable-error'
import { QuotePresenter } from '../presenters/quote-presenter'

const updateQuoteBodySchema = z.object({
  clientId: z.uuid().optional().nullable(),
  notes: z.string().optional().nullable(),
  validUntil: z.coerce.date().optional().nullable(),
  discountType: z.enum(['PERCENT', 'AMOUNT']).optional().nullable(),
  discountValue: z.number().min(0).optional().nullable(),
  quoteType: z.enum(['CUTTING', 'SALE']).optional(),
  saleMarkupType: z.enum(['PERCENT', 'AMOUNT']).optional().nullable(),
  saleMarkupValue: z.number().min(0).max(1000).optional().nullable(),
})

type UpdateQuoteBodySchema = z.infer<typeof updateQuoteBodySchema>

const bodyValidationPipe = new ZodValidationPipe(updateQuoteBodySchema)

@Controller('/quotes/:id')
export class UpdateQuoteController {
  constructor(
    private updateQuote: UpdateQuoteUseCase,
    private getQuoteById: GetQuoteByIdUseCase,
  ) { }

  @Patch()
  async handle(
    @Param('id') quoteId: string,
    @Body(bodyValidationPipe) body: UpdateQuoteBodySchema,
  ) {
    const { clientId, notes, validUntil, discountType, discountValue, quoteType, saleMarkupType, saleMarkupValue } = body

    const result = await this.updateQuote.execute({
      quoteId,
      clientId,
      notes,
      validUntil,
      discountType,
      discountValue,
      quoteType,
      saleMarkupType,
      saleMarkupValue,
    })

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
