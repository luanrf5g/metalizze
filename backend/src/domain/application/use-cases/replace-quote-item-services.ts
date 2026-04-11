import { Injectable } from "@nestjs/common";
import { Either, left, right } from "@/core/logic/Either";
import { QuotesRepository } from "../repositories/quotes-repository";
import { QuoteItem } from "@/domain/enterprise/entities/quote-item";
import { QuoteItemService } from "@/domain/enterprise/entities/quote-item-service";
import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { QuoteNotEditableError } from "./errors/quote-not-editable-error";
import { CalculateQuoteTotalsUseCase } from "./calculate-quote-totals";

interface ServiceInput {
  serviceId: string
  quantity: number
  unitPrice: number
}

interface ReplaceQuoteItemServicesUseCaseRequest {
  quoteId: string
  itemId: string
  services: ServiceInput[]
}

type ReplaceQuoteItemServicesUseCaseResponse = Either<
  ResourceNotFoundError | QuoteNotEditableError,
  { item: QuoteItem; services: QuoteItemService[] }
>

@Injectable()
export class ReplaceQuoteItemServicesUseCase {
  constructor(
    private quotesRepository: QuotesRepository,
    private calculateQuoteTotals: CalculateQuoteTotalsUseCase,
  ) { }

  async execute({
    quoteId,
    itemId,
    services: servicesInput,
  }: ReplaceQuoteItemServicesUseCaseRequest): Promise<ReplaceQuoteItemServicesUseCaseResponse> {
    const quote = await this.quotesRepository.findById(quoteId)
    if (!quote) return left(new ResourceNotFoundError())

    if (quote.status !== 'DRAFT') {
      return left(new QuoteNotEditableError(quote.status))
    }

    const existingItem = await this.quotesRepository.findItemById(itemId)
    if (!existingItem || existingItem.quoteId.toString() !== quoteId) {
      return left(new ResourceNotFoundError())
    }

    const newServices = servicesInput.map((s) =>
      QuoteItemService.create({
        quoteItemId: existingItem.id,
        serviceId: new UniqueEntityId(s.serviceId),
        quantity: s.quantity,
        unitPrice: s.unitPrice,
        totalPrice: s.quantity * s.unitPrice,
      }),
    )

    const newServicesCost = servicesInput.reduce(
      (sum, s) => sum + s.quantity * s.unitPrice,
      0,
    )

    // Rebuild item with new servicesCost so totals recalc is accurate
    const subtotalItemCost =
      existingItem.materialCost +
      existingItem.cuttingCost +
      existingItem.setupCost +
      newServicesCost +
      existingItem.finishingPrice

    let discountAmount = 0
    if (existingItem.discountType === 'PERCENT' && existingItem.discountValue != null) {
      discountAmount = subtotalItemCost * (existingItem.discountValue / 100)
    } else if (existingItem.discountType === 'AMOUNT' && existingItem.discountValue != null) {
      discountAmount = Math.min(existingItem.discountValue, subtotalItemCost)
    }

    const totalItemCost = subtotalItemCost - discountAmount

    const updatedItem = QuoteItem.create(
      {
        quoteId: existingItem.quoteId,
        partNumber: existingItem.partNumber,
        itemKind: existingItem.itemKind,
        sheetId: existingItem.sheetId,
        profileId: existingItem.profileId,
        materialName: existingItem.materialName,
        thickness: existingItem.thickness,
        sheetWidth: existingItem.sheetWidth,
        sheetHeight: existingItem.sheetHeight,
        profileType: existingItem.profileType,
        profileLength: existingItem.profileLength,
        profileDimensions: existingItem.profileDimensions,
        baseMaterialPrice: existingItem.baseMaterialPrice,
        isManualPrice: existingItem.isManualPrice,
        isFullMaterial: existingItem.isFullMaterial,
        cuttingGasId: existingItem.cuttingGasId,
        cuttingTimeMinutes: existingItem.cuttingTimeMinutes,
        cutWidth: existingItem.cutWidth,
        cutHeight: existingItem.cutHeight,
        cutLength: existingItem.cutLength,
        usagePercentage: existingItem.usagePercentage,
        setupRateId: existingItem.setupRateId,
        setupTimeMinutes: existingItem.setupTimeMinutes,
        setupPricePerHour: existingItem.setupPricePerHour,
        finishingDescription: existingItem.finishingDescription,
        finishingPrice: existingItem.finishingPrice,
        materialCost: existingItem.materialCost,
        cuttingCost: existingItem.cuttingCost,
        setupCost: existingItem.setupCost,
        servicesCost: newServicesCost,
        subtotalItemCost,
        discountType: existingItem.discountType,
        discountValue: existingItem.discountValue,
        discountAmount,
        totalItemCost,
        createdAt: existingItem.createdAt,
      },
      existingItem.id,
    )

    await this.quotesRepository.replaceItemServices(itemId, newServices)
    await this.quotesRepository.saveItem(updatedItem)
    await this.calculateQuoteTotals.execute({ quoteId })

    return right({ item: updatedItem, services: newServices })
  }
}
