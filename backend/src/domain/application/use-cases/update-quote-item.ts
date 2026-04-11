import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/logic/Either";
import { QuotesRepository } from "../repositories/quotes-repository";
import { CuttingGasRepository } from "../repositories/cutting-gas-repository";
import { QuoteItem, QuoteItemKind } from "@/domain/enterprise/entities/quote-item";
import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { DiscountType } from "@/domain/enterprise/entities/quote";
import { ProfileType } from "@/domain/enterprise/entities/profile";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { QuoteNotEditableError } from "./errors/quote-not-editable-error";
import { CalculateQuoteTotalsUseCase } from "./calculate-quote-totals";

interface UpdateQuoteItemUseCaseRequest {
  quoteId: string
  itemId: string
  itemKind?: QuoteItemKind
  sheetId?: string | null
  profileId?: string | null
  materialName?: string
  thickness?: number
  sheetWidth?: number | null
  sheetHeight?: number | null
  profileType?: ProfileType | null
  profileLength?: number | null
  profileDimensions?: string | null
  baseMaterialPrice?: number
  isManualPrice?: boolean
  isFullMaterial?: boolean
  usagePercentage?: number | null
  cuttingGasId?: string
  cuttingTimeMinutes?: number
  cutWidth?: number | null
  cutHeight?: number | null
  cutLength?: number | null
  setupRateId?: string | null
  setupTimeMinutes?: number
  setupPricePerHour?: number
  finishingDescription?: string | null
  finishingPrice?: number
  discountType?: DiscountType | null
  discountValue?: number | null
}

type UpdateQuoteItemUseCaseResponse = Either<
  ResourceNotFoundError | QuoteNotEditableError,
  { item: QuoteItem }
>

@Injectable()
export class UpdateQuoteItemUseCase {
  constructor(
    private quotesRepository: QuotesRepository,
    private cuttingGasRepository: CuttingGasRepository,
    private calculateQuoteTotals: CalculateQuoteTotalsUseCase,
  ) { }

  async execute(request: UpdateQuoteItemUseCaseRequest): Promise<UpdateQuoteItemUseCaseResponse> {
    const { quoteId, itemId } = request

    const quote = await this.quotesRepository.findById(quoteId)
    if (!quote) return left(new ResourceNotFoundError())

    if (quote.status !== 'DRAFT') {
      return left(new QuoteNotEditableError(quote.status))
    }

    const existingItem = await this.quotesRepository.findItemById(itemId)
    if (!existingItem || existingItem.quoteId.toString() !== quoteId) {
      return left(new ResourceNotFoundError())
    }

    // Merge overrides onto existing item values
    const itemKind = request.itemKind ?? existingItem.itemKind
    const materialName = request.materialName ?? existingItem.materialName
    const thickness = request.thickness ?? existingItem.thickness
    const baseMaterialPrice = request.baseMaterialPrice ?? existingItem.baseMaterialPrice
    const isFullMaterial = request.isFullMaterial ?? existingItem.isFullMaterial
    const usagePercentage = request.usagePercentage !== undefined
      ? request.usagePercentage
      : existingItem.usagePercentage
    const cuttingTimeMinutes = request.cuttingTimeMinutes ?? existingItem.cuttingTimeMinutes
    const setupTimeMinutes = request.setupTimeMinutes ?? existingItem.setupTimeMinutes
    const setupPricePerHour = request.setupPricePerHour ?? existingItem.setupPricePerHour
    const finishingPrice = request.finishingPrice ?? existingItem.finishingPrice
    const discountType = request.discountType !== undefined
      ? request.discountType
      : existingItem.discountType
    const discountValue = request.discountValue !== undefined
      ? request.discountValue
      : existingItem.discountValue

    const cuttingGasIdStr = request.cuttingGasId ?? existingItem.cuttingGasId.toString()
    const cuttingGas = await this.cuttingGasRepository.findById(cuttingGasIdStr)
    if (!cuttingGas) return left(new ResourceNotFoundError())

    // Recalculate costs
    const materialCost = isFullMaterial
      ? baseMaterialPrice
      : usagePercentage != null
        ? baseMaterialPrice * (usagePercentage / 100)
        : baseMaterialPrice

    const cuttingCost = (cuttingTimeMinutes / 60) * cuttingGas.pricePerHour
    const setupCost = (setupTimeMinutes / 60) * setupPricePerHour
    const subtotalItemCost =
      materialCost + cuttingCost + setupCost + existingItem.servicesCost + finishingPrice

    let discountAmount = 0
    if (discountType === 'PERCENT' && discountValue != null) {
      discountAmount = subtotalItemCost * (discountValue / 100)
    } else if (discountType === 'AMOUNT' && discountValue != null) {
      discountAmount = Math.min(discountValue, subtotalItemCost)
    }

    const totalItemCost = subtotalItemCost - discountAmount

    const updatedItem = QuoteItem.create(
      {
        quoteId: existingItem.quoteId,
        partNumber: existingItem.partNumber,
        itemKind,
        sheetId: request.sheetId !== undefined
          ? (request.sheetId ? new UniqueEntityId(request.sheetId) : null)
          : existingItem.sheetId,
        profileId: request.profileId !== undefined
          ? (request.profileId ? new UniqueEntityId(request.profileId) : null)
          : existingItem.profileId,
        materialName,
        thickness,
        sheetWidth: request.sheetWidth !== undefined ? request.sheetWidth : existingItem.sheetWidth,
        sheetHeight: request.sheetHeight !== undefined ? request.sheetHeight : existingItem.sheetHeight,
        profileType: request.profileType !== undefined ? request.profileType : existingItem.profileType,
        profileLength: request.profileLength !== undefined ? request.profileLength : existingItem.profileLength,
        profileDimensions: request.profileDimensions !== undefined ? request.profileDimensions : existingItem.profileDimensions,
        baseMaterialPrice,
        isManualPrice: request.isManualPrice ?? existingItem.isManualPrice,
        isFullMaterial,
        cuttingGasId: new UniqueEntityId(cuttingGasIdStr),
        cuttingTimeMinutes,
        cutWidth: request.cutWidth !== undefined ? request.cutWidth : existingItem.cutWidth,
        cutHeight: request.cutHeight !== undefined ? request.cutHeight : existingItem.cutHeight,
        cutLength: request.cutLength !== undefined ? request.cutLength : existingItem.cutLength,
        usagePercentage,
        setupRateId: request.setupRateId !== undefined
          ? (request.setupRateId ? new UniqueEntityId(request.setupRateId) : null)
          : existingItem.setupRateId,
        setupTimeMinutes,
        setupPricePerHour,
        finishingDescription: request.finishingDescription !== undefined
          ? request.finishingDescription
          : existingItem.finishingDescription,
        finishingPrice,
        materialCost,
        cuttingCost,
        setupCost,
        servicesCost: existingItem.servicesCost,
        subtotalItemCost,
        discountType,
        discountValue,
        discountAmount,
        totalItemCost,
        createdAt: existingItem.createdAt,
      },
      existingItem.id,
    )

    await this.quotesRepository.saveItem(updatedItem)
    await this.calculateQuoteTotals.execute({ quoteId })

    return right({ item: updatedItem })
  }
}
