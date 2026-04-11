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
import { UpdateQuoteItemUseCase } from '@/domain/application/use-cases/update-quote-item'
import { GetQuoteByIdUseCase } from '@/domain/application/use-cases/get-quote-by-id'
import { ResourceNotFoundError } from '@/domain/application/use-cases/errors/resource-not-found-error'
import { QuoteNotEditableError } from '@/domain/application/use-cases/errors/quote-not-editable-error'
import { QuotePresenter } from '../presenters/quote-presenter'

const updateQuoteItemBodySchema = z.object({
  itemKind: z.enum(['SHEET', 'PROFILE']).optional(),
  sheetId: z.uuid().optional().nullable(),
  profileId: z.uuid().optional().nullable(),
  materialName: z.string().min(1).optional(),
  thickness: z.number().positive().optional(),
  sheetWidth: z.number().positive().optional().nullable(),
  sheetHeight: z.number().positive().optional().nullable(),
  profileType: z
    .enum(['SQUARE', 'RECTANGULAR', 'ROUND', 'OBLONG', 'ANGLE', 'U_CHANNEL'])
    .optional()
    .nullable(),
  profileLength: z.number().positive().optional().nullable(),
  profileDimensions: z.string().optional().nullable(),
  baseMaterialPrice: z.number().min(0).optional(),
  isManualPrice: z.boolean().optional(),
  isFullMaterial: z.boolean().optional(),
  materialCalcMode: z.enum(['SIMPLE_CUT', 'NEST_UNITS']).optional(),
  // Nest CHAPA
  sheetCount: z.number().int().min(1).optional(),
  hasPartialLastSheet: z.boolean().optional(),
  partialSheetWidth: z.number().positive().optional().nullable(),
  partialSheetHeight: z.number().positive().optional().nullable(),
  chargeFullLastSheet: z.boolean().optional(),
  // Nest PERFIL
  profileBarCount: z.number().int().min(1).optional(),
  hasPartialLastProfileBar: z.boolean().optional(),
  partialProfileLength: z.number().positive().optional().nullable(),
  chargeFullLastProfileBar: z.boolean().optional(),
  scrapNotes: z.string().optional().nullable(),
  // Geral
  isMaterialProvidedByClient: z.boolean().optional(),
  usagePercentage: z.number().min(0).max(100).optional().nullable(),
  cuttingGasId: z.uuid().optional(),
  cuttingTimeMinutes: z.number().min(0).optional(),
  cutWidth: z.number().positive().optional().nullable(),
  cutHeight: z.number().positive().optional().nullable(),
  cutLength: z.number().positive().optional().nullable(),
  setupRateId: z.uuid().optional().nullable(),
  setupTimeMinutes: z.number().min(0).optional(),
  setupPricePerHour: z.number().min(0).optional(),
  finishingDescription: z.string().optional().nullable(),
  finishingPrice: z.number().min(0).optional(),
  discountType: z.enum(['PERCENT', 'AMOUNT']).optional().nullable(),
  discountValue: z.number().min(0).optional().nullable(),
})

type UpdateQuoteItemBodySchema = z.infer<typeof updateQuoteItemBodySchema>

const bodyValidationPipe = new ZodValidationPipe(updateQuoteItemBodySchema)

@Controller('/quotes/:id/items/:itemId')
export class UpdateQuoteItemController {
  constructor(
    private updateQuoteItem: UpdateQuoteItemUseCase,
    private getQuoteById: GetQuoteByIdUseCase,
  ) {}

  @Patch()
  async handle(
    @Param('id') quoteId: string,
    @Param('itemId') itemId: string,
    @Body(bodyValidationPipe) body: UpdateQuoteItemBodySchema,
  ) {
    const result = await this.updateQuoteItem.execute({
      quoteId,
      itemId,
      ...body,
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
