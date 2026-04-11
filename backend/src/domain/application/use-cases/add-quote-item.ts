import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/logic/Either";
import { QuotesRepository } from "../repositories/quotes-repository";
import { CuttingGasRepository } from "../repositories/cutting-gas-repository";
import { QuoteItem, QuoteItemKind } from "@/domain/enterprise/entities/quote-item";
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
  usagePercentage?: number | null
  cuttingGasId: string
  cuttingTimeMinutes: number
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
      usagePercentage,
      cuttingGasId,
      cuttingTimeMinutes,
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
    if (!quote) {
      return left(new ResourceNotFoundError())
    }

    const cuttingGas = await this.cuttingGasRepository.findById(cuttingGasId)
    if (!cuttingGas) {
      return left(new ResourceNotFoundError())
    }

    // Calculate costs
    const materialCost = isFullMaterial
      ? baseMaterialPrice
      : usagePercentage != null
        ? baseMaterialPrice * (usagePercentage / 100)
        : baseMaterialPrice

    const cuttingCost = (cuttingTimeMinutes / 60) * cuttingGas.pricePerHour
    const setupCost = (setupTimeMinutes / 60) * setupPricePerHour
    const servicesCost = servicesInput.reduce(
      (sum, s) => sum + s.quantity * s.unitPrice,
      0,
    )

    const subtotalItemCost =
      materialCost + cuttingCost + setupCost + servicesCost + finishingPrice

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
      cuttingGasId: new UniqueEntityId(cuttingGasId),
      cuttingTimeMinutes,
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
