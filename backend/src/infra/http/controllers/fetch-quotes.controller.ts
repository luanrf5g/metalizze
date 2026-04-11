import z from 'zod'
import { BadRequestException, Controller, Get, Query } from '@nestjs/common'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'
import { FetchQuotesUseCase } from '@/domain/application/use-cases/fetch-quotes'
import { QuotePresenter } from '../presenters/quote-presenter'

const fetchQuotesQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform(Number)
    .pipe(z.number().min(1)),
  status: z
    .enum(['DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED'])
    .optional()
    .nullable(),
  clientId: z.uuid().optional().nullable(),
})

type FetchQuotesQuerySchema = z.infer<typeof fetchQuotesQuerySchema>

const queryValidationPipe = new ZodValidationPipe(fetchQuotesQuerySchema)

@Controller('/quotes')
export class FetchQuotesController {
  constructor(private fetchQuotes: FetchQuotesUseCase) { }

  @Get()
  async handle(@Query(queryValidationPipe) query: FetchQuotesQuerySchema) {
    const { page, status, clientId } = query

    const result = await this.fetchQuotes.execute({
      page,
      status: status ?? null,
      clientId: clientId ?? null,
    })

    if (result.isLeft()) {
      throw new BadRequestException(result.value)
    }

    const { quotes } = result.value

    return {
      quotes: quotes.map(QuotePresenter.toHTTPList),
    }
  }
}
