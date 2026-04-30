import z from 'zod'
import { BadRequestException, Controller, Get, Query } from '@nestjs/common'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'
import { FetchQuotesUseCase } from '@/domain/application/use-cases/fetch-quotes'
import { QuotePresenter } from '../presenters/quote-presenter'
import { QuoteStatus, QuoteType } from '@/domain/enterprise/entities/quote'

const VALID_STATUSES = ['DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED'] as const
const VALID_QUOTE_TYPES = ['CUTTING', 'SALE'] as const

const fetchQuotesQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform(Number)
    .pipe(z.number().int().min(1)),
  perPage: z
    .string()
    .optional()
    .default('20')
    .transform(Number)
    .pipe(z.number().int().min(1).max(100)),
  sortBy: z
    .enum(['createdAt', 'updatedAt', 'totalQuote', 'code'])
    .optional()
    .default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  status: z
    .string()
    .optional()
    .transform((v) => {
      if (!v) return null
      const parts = v.split(',').map((s) => s.trim())
      for (const p of parts) {
        if (!VALID_STATUSES.includes(p as typeof VALID_STATUSES[number])) {
          throw new Error(`Invalid status value: ${p}`)
        }
      }
      return parts as QuoteStatus[]
    }),
  quoteType: z
    .string()
    .optional()
    .transform((v) => {
      if (!v) return null
      if (!VALID_QUOTE_TYPES.includes(v as typeof VALID_QUOTE_TYPES[number])) {
        throw new Error(`Invalid quoteType value: ${v}`)
      }
      return v as QuoteType
    }),
  clientId: z.string().uuid().optional().transform((v) => v ?? null),
  createdById: z.string().uuid().optional().transform((v) => v ?? null),
  code: z.string().optional().transform((v) => v ?? null),
  from: z.string().optional().transform((v) => (v ? new Date(v) : null)),
  to: z.string().optional().transform((v) => (v ? new Date(v) : null)),
})

type FetchQuotesQuerySchema = z.infer<typeof fetchQuotesQuerySchema>

const queryValidationPipe = new ZodValidationPipe(fetchQuotesQuerySchema)

@Controller('/quotes')
export class FetchQuotesController {
  constructor(private fetchQuotes: FetchQuotesUseCase) { }

  @Get()
  async handle(@Query(queryValidationPipe) query: FetchQuotesQuerySchema) {
    const { page, perPage, sortBy, sortOrder, status, quoteType, clientId, createdById, code, from, to } =
      query

    const result = await this.fetchQuotes.execute({
      page,
      perPage,
      sortBy,
      sortOrder,
      status: status ?? null,
      quoteType: quoteType ?? null,
      clientId: clientId ?? null,
      createdById: createdById ?? null,
      code: code ?? null,
      from: from ?? null,
      to: to ?? null,
    })

    if (result.isLeft()) {
      throw new BadRequestException(result.value)
    }

    const { quotes, meta } = result.value

    return {
      quotes: quotes.map(QuotePresenter.toHTTPList),
      meta,
    }
  }
}
