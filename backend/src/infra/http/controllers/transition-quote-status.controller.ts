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
import { TransitionQuoteStatusUseCase } from '@/domain/application/use-cases/transition-quote-status'
import { GetQuoteByIdUseCase } from '@/domain/application/use-cases/get-quote-by-id'
import { ResourceNotFoundError } from '@/domain/application/use-cases/errors/resource-not-found-error'
import { InvalidQuoteStatusTransitionError } from '@/domain/application/use-cases/errors/invalid-quote-status-transition-error'
import { QuotePresenter } from '../presenters/quote-presenter'

const transitionQuoteStatusBodySchema = z.object({
  status: z.enum(['DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED']),
})

type TransitionQuoteStatusBodySchema = z.infer<typeof transitionQuoteStatusBodySchema>

const bodyValidationPipe = new ZodValidationPipe(transitionQuoteStatusBodySchema)

@Controller('/quotes/:id/status')
export class TransitionQuoteStatusController {
  constructor(
    private transitionQuoteStatus: TransitionQuoteStatusUseCase,
    private getQuoteById: GetQuoteByIdUseCase,
  ) { }

  @Patch()
  async handle(
    @Param('id') quoteId: string,
    @Body(bodyValidationPipe) body: TransitionQuoteStatusBodySchema,
  ) {
    const { status } = body

    const result = await this.transitionQuoteStatus.execute({
      quoteId,
      toStatus: status,
    })

    if (result.isLeft()) {
      const error = result.value
      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        case InvalidQuoteStatusTransitionError:
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
