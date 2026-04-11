import z from 'zod'
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'
import { AddQuoteItemUseCase } from '@/domain/application/use-cases/add-quote-item'
import { GetQuoteByIdUseCase } from '@/domain/application/use-cases/get-quote-by-id'
import { ResourceNotFoundError } from '@/domain/application/use-cases/errors/resource-not-found-error'
import { QuotePresenter } from '../presenters/quote-presenter'

const serviceSchema = z.object({
  serviceId: z.uuid(),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0).optional().default(0),
})

const addQuoteItemBodySchema = z.object({
  itemKind: z.enum(['SHEET', 'PROFILE']),
  sheetId: z.uuid().optional().nullable(),
  profileId: z.uuid().optional().nullable(),
  materialName: z.string().min(1),
  thickness: z.number().positive(),
  sheetWidth: z.number().positive().optional().nullable(),
  sheetHeight: z.number().positive().optional().nullable(),
  profileType: z
    .enum(['SQUARE', 'RECTANGULAR', 'ROUND', 'OBLONG', 'ANGLE', 'U_CHANNEL'])
    .optional()
    .nullable(),
  profileLength: z.number().positive().optional().nullable(),
  profileDimensions: z.string().optional().nullable(),
  baseMaterialPrice: z.number().min(0),
  isManualPrice: z.boolean().optional().default(false),
  isFullMaterial: z.boolean().optional().default(false),
  usagePercentage: z.number().min(0).max(100).optional().nullable(),
  cuttingGasId: z.uuid(),
  cuttingTimeMinutes: z.number().min(0),
  cutWidth: z.number().positive().optional().nullable(),
  cutHeight: z.number().positive().optional().nullable(),
  cutLength: z.number().positive().optional().nullable(),
  setupRateId: z.uuid().optional().nullable(),
  setupTimeMinutes: z.number().min(0).optional().default(0),
  setupPricePerHour: z.number().min(0).optional().default(0),
  finishingDescription: z.string().optional().nullable(),
  finishingPrice: z.number().min(0).optional().default(0),
  discountType: z.enum(['PERCENT', 'AMOUNT']).optional().nullable(),
  discountValue: z.number().min(0).optional().nullable(),
  services: z.array(serviceSchema).optional().default([]),
})

type AddQuoteItemBodySchema = z.infer<typeof addQuoteItemBodySchema>

const bodyValidationPipe = new ZodValidationPipe(addQuoteItemBodySchema)

@Controller('/quotes/:id/items')
export class AddQuoteItemController {
  constructor(
    private addQuoteItem: AddQuoteItemUseCase,
    private getQuoteById: GetQuoteByIdUseCase,
  ) { }

  @Post()
  @HttpCode(201)
  async handle(
    @Param('id') quoteId: string,
    @Body(bodyValidationPipe) body: AddQuoteItemBodySchema,
  ) {
    const result = await this.addQuoteItem.execute({
      quoteId,
      itemKind: body.itemKind,
      sheetId: body.sheetId ?? null,
      profileId: body.profileId ?? null,
      materialName: body.materialName,
      thickness: body.thickness,
      sheetWidth: body.sheetWidth ?? null,
      sheetHeight: body.sheetHeight ?? null,
      profileType: body.profileType ?? null,
      profileLength: body.profileLength ?? null,
      profileDimensions: body.profileDimensions ?? null,
      baseMaterialPrice: body.baseMaterialPrice,
      isManualPrice: body.isManualPrice,
      isFullMaterial: body.isFullMaterial,
      usagePercentage: body.usagePercentage ?? null,
      cuttingGasId: body.cuttingGasId,
      cuttingTimeMinutes: body.cuttingTimeMinutes,
      cutWidth: body.cutWidth ?? null,
      cutHeight: body.cutHeight ?? null,
      cutLength: body.cutLength ?? null,
      setupRateId: body.setupRateId ?? null,
      setupTimeMinutes: body.setupTimeMinutes,
      setupPricePerHour: body.setupPricePerHour,
      finishingDescription: body.finishingDescription ?? null,
      finishingPrice: body.finishingPrice,
      discountType: body.discountType ?? null,
      discountValue: body.discountValue ?? null,
      services: body.services,
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

    const withItems = await this.getQuoteById.execute({ quoteId })
    if (withItems.isLeft()) {
      throw new BadRequestException(withItems.value.message)
    }

    return {
      quote: QuotePresenter.toHTTPWithItems(withItems.value.quoteWithItems),
    }
  }
}
