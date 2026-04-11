import z from 'zod'
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Post,
} from '@nestjs/common'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'
import { CreateQuoteUseCase } from '@/domain/application/use-cases/create-quote'
import { GetQuoteByIdUseCase } from '@/domain/application/use-cases/get-quote-by-id'
import { ResourceNotFoundError } from '@/domain/application/use-cases/errors/resource-not-found-error'
import { CurrentUser } from '@/infra/auth/decorators/current-user.decorator'
import type { UserPayload } from '@/infra/auth/decorators/current-user.decorator'
import { QuotePresenter } from '../presenters/quote-presenter'

const createQuoteBodySchema = z.object({
  clientId: z.uuid().optional().nullable(),
  notes: z.string().optional().nullable(),
  validUntil: z.coerce.date().optional().nullable(),
  discountType: z.enum(['PERCENT', 'AMOUNT']).optional().nullable(),
  discountValue: z.number().min(0).optional().nullable(),
})

type CreateQuoteBodySchema = z.infer<typeof createQuoteBodySchema>

const bodyValidationPipe = new ZodValidationPipe(createQuoteBodySchema)

@Controller('/quotes')
export class CreateQuoteController {
  constructor(
    private createQuote: CreateQuoteUseCase,
    private getQuoteById: GetQuoteByIdUseCase,
  ) { }

  @Post()
  @HttpCode(201)
  async handle(
    @Body(bodyValidationPipe) body: CreateQuoteBodySchema,
    @CurrentUser() userPayload: UserPayload,
  ) {
    const { clientId, notes, validUntil, discountType, discountValue } = body

    const result = await this.createQuote.execute({
      clientId: clientId ?? null,
      notes: notes ?? null,
      validUntil: validUntil ?? null,
      createdById: userPayload.sub,
      discountType: discountType ?? null,
      discountValue: discountValue ?? null,
    })

    if (result.isLeft()) {
      const error = result.value
      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    const { quote } = result.value

    const withItems = await this.getQuoteById.execute({ quoteId: quote.id.toString() })
    if (withItems.isLeft()) {
      throw new BadRequestException(withItems.value.message)
    }

    return {
      quote: QuotePresenter.toHTTPWithItems(withItems.value.quoteWithItems),
    }
  }
}
