import z from 'zod'
import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  NotFoundException,
  Param,
  Put,
} from '@nestjs/common'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'
import { ReplaceQuoteItemServicesUseCase } from '@/domain/application/use-cases/replace-quote-item-services'
import { GetQuoteByIdUseCase } from '@/domain/application/use-cases/get-quote-by-id'
import { ResourceNotFoundError } from '@/domain/application/use-cases/errors/resource-not-found-error'
import { QuoteNotEditableError } from '@/domain/application/use-cases/errors/quote-not-editable-error'
import { QuotePresenter } from '../presenters/quote-presenter'

const serviceSchema = z.object({
  serviceId: z.string().uuid(),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0).optional().default(0),
})

const replaceQuoteItemServicesBodySchema = z.object({
  services: z.array(serviceSchema),
})

type ReplaceQuoteItemServicesBodySchema = z.infer<typeof replaceQuoteItemServicesBodySchema>

const bodyValidationPipe = new ZodValidationPipe(replaceQuoteItemServicesBodySchema)

@Controller('/quotes/:id/items/:itemId/services')
export class ReplaceQuoteItemServicesController {
  constructor(
    private replaceQuoteItemServices: ReplaceQuoteItemServicesUseCase,
    private getQuoteById: GetQuoteByIdUseCase,
  ) { }

  @Put()
  async handle(
    @Param('id') quoteId: string,
    @Param('itemId') itemId: string,
    @Body(bodyValidationPipe) body: ReplaceQuoteItemServicesBodySchema,
  ) {
    const result = await this.replaceQuoteItemServices.execute({
      quoteId,
      itemId,
      services: body.services,
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
