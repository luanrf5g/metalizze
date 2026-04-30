import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/logic/Either";
import { QuotesRepository } from "../repositories/quotes-repository";
import { CuttingGasRepository } from "../repositories/cutting-gas-repository";
import { QuoteItem, QuoteItemKind, MaterialCalcMode } from "@/domain/enterprise/entities/quote-item";
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
  materialCalcMode?: MaterialCalcMode
  // Nest CHAPA
  sheetCount?: number
  hasPartialLastSheet?: boolean
  partialSheetWidth?: number | null
  partialSheetHeight?: number | null
  chargeFullLastSheet?: boolean
  // Nest PERFIL
  profileBarCount?: number
  hasPartialLastProfileBar?: boolean
  partialProfileLength?: number | null
  chargeFullLastProfileBar?: boolean
  scrapNotes?: string | null
  // Geral
  isMaterialProvidedByClient?: boolean
  usagePercentage?: number | null
  cuttingGasId?: string
  cuttingTimeMinutes?: number
  chargeMinimumCutting?: boolean
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

function computeSheetMaterialUnits(params: {
  materialCalcMode: MaterialCalcMode
  isFullMaterial: boolean
  sheetCount: number
  hasPartialLastSheet: boolean
  chargeFullLastSheet: boolean
  partialSheetWidth?: number | null
  partialSheetHeight?: number | null
  sheetWidth?: number | null
  sheetHeight?: number | null
  cutWidth?: number | null
  cutHeight?: number | null
  usagePercentage?: number | null
}): number {
  if (params.isFullMaterial) return params.sheetCount

  if (params.materialCalcMode === 'SIMPLE_CUT') {
    const cw = params.cutWidth
    const ch = params.cutHeight
    const sw = params.sheetWidth
    const sh = params.sheetHeight
    if (cw != null && ch != null && sw != null && sh != null && sw > 0 && sh > 0) {
      return Math.min(1, (cw * ch) / (sw * sh))
    }
    return 1
  }

  if (params.hasPartialLastSheet) {
    if (params.chargeFullLastSheet) return params.sheetCount
    const pw = params.partialSheetWidth
    const ph = params.partialSheetHeight
    const sw = params.sheetWidth
    const sh = params.sheetHeight
    if (pw != null && ph != null && sw != null && sh != null && sw > 0 && sh > 0) {
      const partialUsage = Math.min(1, (pw * ph) / (sw * sh))
      return (params.sheetCount - 1) + partialUsage
    }
  }

  if (params.sheetCount === 1 && params.usagePercentage != null) {
    return params.usagePercentage / 100
  }

  return params.sheetCount
}

function computeProfileBarMaterialUnits(params: {
  materialCalcMode: MaterialCalcMode
  isFullMaterial: boolean
  profileBarCount: number
  hasPartialLastProfileBar: boolean
  chargeFullLastProfileBar: boolean
  partialProfileLength?: number | null
  profileLength?: number | null
  cutLength?: number | null
  usagePercentage?: number | null
}): number {
  if (params.isFullMaterial) return params.profileBarCount

  if (params.materialCalcMode === 'SIMPLE_CUT') {
    const cl = params.cutLength
    const pl = params.profileLength
    if (cl != null && pl != null && pl > 0) {
      return Math.min(1, cl / pl)
    }
    if (params.usagePercentage != null) return params.usagePercentage / 100
    return 1
  }

  if (params.hasPartialLastProfileBar) {
    if (params.chargeFullLastProfileBar) return params.profileBarCount
    const pp = params.partialProfileLength
    const pl = params.profileLength
    if (pp != null && pl != null && pl > 0) {
      const partialUsage = Math.min(1, pp / pl)
      return (params.profileBarCount - 1) + partialUsage
    }
  }

  if (params.profileBarCount === 1 && params.usagePercentage != null) {
    return params.usagePercentage / 100
  }

  return params.profileBarCount
}

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

    const itemKind = request.itemKind ?? existingItem.itemKind
    const materialName = request.materialName ?? existingItem.materialName
    const thickness = request.thickness ?? existingItem.thickness
    const baseMaterialPrice = request.baseMaterialPrice ?? existingItem.baseMaterialPrice
    const isFullMaterial = request.isFullMaterial ?? existingItem.isFullMaterial
    const materialCalcMode = request.materialCalcMode ?? existingItem.materialCalcMode

    const sheetWidth = request.sheetWidth !== undefined ? request.sheetWidth : existingItem.sheetWidth
    const sheetHeight = request.sheetHeight !== undefined ? request.sheetHeight : existingItem.sheetHeight
    const sheetCount = request.sheetCount ?? existingItem.sheetCount
    const hasPartialLastSheet = request.hasPartialLastSheet ?? existingItem.hasPartialLastSheet
    const partialSheetWidth = request.partialSheetWidth !== undefined ? request.partialSheetWidth : existingItem.partialSheetWidth
    const partialSheetHeight = request.partialSheetHeight !== undefined ? request.partialSheetHeight : existingItem.partialSheetHeight
    const chargeFullLastSheet = request.chargeFullLastSheet ?? existingItem.chargeFullLastSheet

    const profileLength = request.profileLength !== undefined ? request.profileLength : existingItem.profileLength
    const profileBarCount = request.profileBarCount ?? existingItem.profileBarCount
    const hasPartialLastProfileBar = request.hasPartialLastProfileBar ?? existingItem.hasPartialLastProfileBar
    const partialProfileLength = request.partialProfileLength !== undefined ? request.partialProfileLength : existingItem.partialProfileLength
    const chargeFullLastProfileBar = request.chargeFullLastProfileBar ?? existingItem.chargeFullLastProfileBar
    const scrapNotes = request.scrapNotes !== undefined ? request.scrapNotes : existingItem.scrapNotes

    const isMaterialProvidedByClient = request.isMaterialProvidedByClient ?? existingItem.isMaterialProvidedByClient
    const usagePercentage = request.usagePercentage !== undefined ? request.usagePercentage : existingItem.usagePercentage
    const cutWidth = request.cutWidth !== undefined ? request.cutWidth : existingItem.cutWidth
    const cutHeight = request.cutHeight !== undefined ? request.cutHeight : existingItem.cutHeight
    const cutLength = request.cutLength !== undefined ? request.cutLength : existingItem.cutLength
    const cuttingTimeMinutes = request.cuttingTimeMinutes ?? existingItem.cuttingTimeMinutes
    const chargeMinimumCutting = request.chargeMinimumCutting ?? existingItem.chargeMinimumCutting
    const setupTimeMinutes = request.setupTimeMinutes ?? existingItem.setupTimeMinutes
    const setupPricePerHour = request.setupPricePerHour ?? existingItem.setupPricePerHour
    const finishingPrice = request.finishingPrice ?? existingItem.finishingPrice
    const discountType = request.discountType !== undefined ? request.discountType : existingItem.discountType
    const discountValue = request.discountValue !== undefined ? request.discountValue : existingItem.discountValue

    const cuttingGasIdStr = request.cuttingGasId ?? existingItem.cuttingGasId.toString()
    const cuttingGas = await this.cuttingGasRepository.findById(cuttingGasIdStr)
    if (!cuttingGas) return left(new ResourceNotFoundError())

    let computedSheetUnits = existingItem.computedSheetUnits
    let computedProfileBarUnits = existingItem.computedProfileBarUnits
    let materialCost = 0

    if (itemKind === 'SHEET') {
      computedSheetUnits = computeSheetMaterialUnits({
        materialCalcMode, isFullMaterial, sheetCount,
        hasPartialLastSheet, chargeFullLastSheet,
        partialSheetWidth, partialSheetHeight, sheetWidth, sheetHeight,
        cutWidth, cutHeight, usagePercentage,
      })
      materialCost = baseMaterialPrice * computedSheetUnits
    } else {
      computedProfileBarUnits = computeProfileBarMaterialUnits({
        materialCalcMode, isFullMaterial, profileBarCount,
        hasPartialLastProfileBar, chargeFullLastProfileBar,
        partialProfileLength, profileLength, cutLength, usagePercentage,
      })
      materialCost = baseMaterialPrice * computedProfileBarUnits
    }

    const materialCharged = isMaterialProvidedByClient ? 0 : materialCost
    const effectiveCuttingTimeMinutes = chargeMinimumCutting ? 15 : cuttingTimeMinutes
    const cuttingCost = (effectiveCuttingTimeMinutes / 60) * cuttingGas.pricePerHour
    const setupCost = (setupTimeMinutes / 60) * setupPricePerHour
    const subtotalItemCost = materialCharged + cuttingCost + setupCost + existingItem.servicesCost + finishingPrice

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
        sheetId: request.sheetId !== undefined ? (request.sheetId ? new UniqueEntityId(request.sheetId) : null) : existingItem.sheetId,
        profileId: request.profileId !== undefined ? (request.profileId ? new UniqueEntityId(request.profileId) : null) : existingItem.profileId,
        materialName,
        thickness,
        sheetWidth,
        sheetHeight,
        profileType: request.profileType !== undefined ? request.profileType : existingItem.profileType,
        profileLength,
        profileDimensions: request.profileDimensions !== undefined ? request.profileDimensions : existingItem.profileDimensions,
        baseMaterialPrice,
        isManualPrice: request.isManualPrice ?? existingItem.isManualPrice,
        isFullMaterial,
        materialCalcMode,
        sheetCount,
        hasPartialLastSheet,
        partialSheetWidth,
        partialSheetHeight,
        chargeFullLastSheet,
        computedSheetUnits,
        profileBarCount,
        hasPartialLastProfileBar,
        partialProfileLength,
        chargeFullLastProfileBar,
        computedProfileBarUnits,
        scrapNotes,
        isMaterialProvidedByClient,
        cuttingGasId: new UniqueEntityId(cuttingGasIdStr),
        cuttingTimeMinutes,
        chargeMinimumCutting,
        cutWidth,
        cutHeight,
        cutLength,
        usagePercentage,
        setupRateId: request.setupRateId !== undefined ? (request.setupRateId ? new UniqueEntityId(request.setupRateId) : null) : existingItem.setupRateId,
        setupTimeMinutes,
        setupPricePerHour,
        finishingDescription: request.finishingDescription !== undefined ? request.finishingDescription : existingItem.finishingDescription,
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
