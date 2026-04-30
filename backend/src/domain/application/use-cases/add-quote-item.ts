import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/logic/Either";
import { QuotesRepository } from "../repositories/quotes-repository";
import { CuttingGasRepository } from "../repositories/cutting-gas-repository";
import { QuoteItem, QuoteItemKind, MaterialCalcMode } from "@/domain/enterprise/entities/quote-item";
import { QuoteItemService } from "@/domain/enterprise/entities/quote-item-service";
import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { DiscountType } from "@/domain/enterprise/entities/quote";
import { ProfileType } from "@/domain/enterprise/entities/profile";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { CalculateQuoteTotalsUseCase } from "./calculate-quote-totals";

interface ServiceInput {
  serviceId: string
  quantity: number
  unitPrice: number
}

interface AddQuoteItemUseCaseRequest {
  quoteId: string
  itemKind: QuoteItemKind
  sheetId?: string | null
  profileId?: string | null
  materialName: string
  thickness: number
  sheetWidth?: number | null
  sheetHeight?: number | null
  profileType?: ProfileType | null
  profileLength?: number | null
  profileDimensions?: string | null
  baseMaterialPrice: number
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
  cuttingGasId: string
  cuttingTimeMinutes: number
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
  services?: ServiceInput[]
}

type AddQuoteItemUseCaseResponse = Either<
  ResourceNotFoundError,
  { item: QuoteItem; services: QuoteItemService[] }
>

/** Compute effective sheet units for SHEET items */
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

  // NEST_UNITS
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

  // Legacy usagePercentage fallback (single-sheet with no partial)
  if (params.sheetCount === 1 && params.usagePercentage != null) {
    return params.usagePercentage / 100
  }

  return params.sheetCount
}

/** Compute effective bar units for PROFILE items */
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
    // Legacy usagePercentage fallback
    if (params.usagePercentage != null) return params.usagePercentage / 100
    return 1
  }

  // NEST_UNITS
  if (params.hasPartialLastProfileBar) {
    if (params.chargeFullLastProfileBar) return params.profileBarCount
    const pp = params.partialProfileLength
    const pl = params.profileLength
    if (pp != null && pl != null && pl > 0) {
      const partialUsage = Math.min(1, pp / pl)
      return (params.profileBarCount - 1) + partialUsage
    }
  }

  // Legacy usagePercentage fallback (single-bar with no partial)
  if (params.profileBarCount === 1 && params.usagePercentage != null) {
    return params.usagePercentage / 100
  }

  return params.profileBarCount
}

@Injectable()
export class AddQuoteItemUseCase {
  constructor(
    private quotesRepository: QuotesRepository,
    private cuttingGasRepository: CuttingGasRepository,
    private calculateQuoteTotals: CalculateQuoteTotalsUseCase,
  ) { }

  async execute(request: AddQuoteItemUseCaseRequest): Promise<AddQuoteItemUseCaseResponse> {
    const {
      quoteId,
      itemKind,
      sheetId,
      profileId,
      materialName,
      thickness,
      sheetWidth,
      sheetHeight,
      profileType,
      profileLength,
      profileDimensions,
      baseMaterialPrice,
      isManualPrice = false,
      isFullMaterial = false,
      materialCalcMode = 'NEST_UNITS',
      sheetCount = 1,
      hasPartialLastSheet = false,
      partialSheetWidth,
      partialSheetHeight,
      chargeFullLastSheet = false,
      profileBarCount = 1,
      hasPartialLastProfileBar = false,
      partialProfileLength,
      chargeFullLastProfileBar = false,
      scrapNotes,
      isMaterialProvidedByClient = false,
      usagePercentage,
      cuttingGasId,
      cuttingTimeMinutes,
      chargeMinimumCutting = false,
      cutWidth,
      cutHeight,
      cutLength,
      setupRateId,
      setupTimeMinutes = 0,
      setupPricePerHour = 0,
      finishingDescription,
      finishingPrice = 0,
      discountType,
      discountValue,
      services: servicesInput = [],
    } = request

    const quote = await this.quotesRepository.findById(quoteId)
    if (!quote) return left(new ResourceNotFoundError())

    const cuttingGas = await this.cuttingGasRepository.findById(cuttingGasId)
    if (!cuttingGas) return left(new ResourceNotFoundError())

    let computedSheetUnits = 1
    let computedProfileBarUnits = 1
    let materialCost = 0

    if (itemKind === 'SHEET') {
      computedSheetUnits = computeSheetMaterialUnits({
        materialCalcMode,
        isFullMaterial,
        sheetCount,
        hasPartialLastSheet,
        chargeFullLastSheet,
        partialSheetWidth: partialSheetWidth ?? null,
        partialSheetHeight: partialSheetHeight ?? null,
        sheetWidth: sheetWidth ?? null,
        sheetHeight: sheetHeight ?? null,
        cutWidth: cutWidth ?? null,
        cutHeight: cutHeight ?? null,
        usagePercentage: usagePercentage ?? null,
      })
      materialCost = baseMaterialPrice * computedSheetUnits
    } else {
      computedProfileBarUnits = computeProfileBarMaterialUnits({
        materialCalcMode,
        isFullMaterial,
        profileBarCount,
        hasPartialLastProfileBar,
        chargeFullLastProfileBar,
        partialProfileLength: partialProfileLength ?? null,
        profileLength: profileLength ?? null,
        cutLength: cutLength ?? null,
        usagePercentage: usagePercentage ?? null,
      })
      materialCost = baseMaterialPrice * computedProfileBarUnits
    }

    const materialCharged = isMaterialProvidedByClient ? 0 : materialCost
    const effectiveCuttingTimeMinutes = chargeMinimumCutting ? 15 : cuttingTimeMinutes
    const cuttingCost = (effectiveCuttingTimeMinutes / 60) * cuttingGas.pricePerHour
    const setupCost = (setupTimeMinutes / 60) * setupPricePerHour
    const servicesCost = servicesInput.reduce((sum, s) => sum + s.quantity * s.unitPrice, 0)
    const subtotalItemCost = materialCharged + cuttingCost + setupCost + servicesCost + finishingPrice

    let discountAmount = 0
    if (discountType === 'PERCENT' && discountValue != null) {
      discountAmount = subtotalItemCost * (discountValue / 100)
    } else if (discountType === 'AMOUNT' && discountValue != null) {
      discountAmount = Math.min(discountValue, subtotalItemCost)
    }

    const totalItemCost = subtotalItemCost - discountAmount
    const partNumber = (await this.quotesRepository.countItemsByQuoteId(quoteId)) + 1

    const item = QuoteItem.create({
      quoteId: new UniqueEntityId(quoteId),
      partNumber,
      itemKind,
      sheetId: sheetId ? new UniqueEntityId(sheetId) : null,
      profileId: profileId ? new UniqueEntityId(profileId) : null,
      materialName,
      thickness,
      sheetWidth: sheetWidth ?? null,
      sheetHeight: sheetHeight ?? null,
      profileType: profileType ?? null,
      profileLength: profileLength ?? null,
      profileDimensions: profileDimensions ?? null,
      baseMaterialPrice,
      isManualPrice,
      isFullMaterial,
      materialCalcMode,
      sheetCount,
      hasPartialLastSheet,
      partialSheetWidth: partialSheetWidth ?? null,
      partialSheetHeight: partialSheetHeight ?? null,
      chargeFullLastSheet,
      computedSheetUnits,
      profileBarCount,
      hasPartialLastProfileBar,
      partialProfileLength: partialProfileLength ?? null,
      chargeFullLastProfileBar,
      computedProfileBarUnits,
      scrapNotes: scrapNotes ?? null,
      isMaterialProvidedByClient,
      cuttingGasId: new UniqueEntityId(cuttingGasId),
      cuttingTimeMinutes,
      chargeMinimumCutting,
      cutWidth: cutWidth ?? null,
      cutHeight: cutHeight ?? null,
      cutLength: cutLength ?? null,
      usagePercentage: usagePercentage ?? null,
      setupRateId: setupRateId ? new UniqueEntityId(setupRateId) : null,
      setupTimeMinutes,
      setupPricePerHour,
      finishingDescription: finishingDescription ?? null,
      finishingPrice,
      materialCost,
      cuttingCost,
      setupCost,
      servicesCost,
      subtotalItemCost,
      discountType: discountType ?? null,
      discountValue: discountValue ?? null,
      discountAmount,
      totalItemCost,
    })

    const services = servicesInput.map((s) =>
      QuoteItemService.create({
        quoteItemId: item.id,
        serviceId: new UniqueEntityId(s.serviceId),
        quantity: s.quantity,
        unitPrice: s.unitPrice,
        totalPrice: s.quantity * s.unitPrice,
      }),
    )

    await this.quotesRepository.addItem(item, services)
    await this.calculateQuoteTotals.execute({ quoteId })

    return right({ item, services })
  }
}
