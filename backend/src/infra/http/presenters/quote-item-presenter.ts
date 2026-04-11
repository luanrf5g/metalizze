import { QuoteItem } from '@/domain/enterprise/entities/quote-item'
import { QuoteItemService } from '@/domain/enterprise/entities/quote-item-service'
import { QuoteItemServicePresenter } from './quote-item-service-presenter'

export class QuoteItemPresenter {
  static toHTTP(item: QuoteItem, services: QuoteItemService[]) {
    return {
      id: item.id.toString(),
      quoteId: item.quoteId.toString(),
      partNumber: item.partNumber,
      itemKind: item.itemKind,
      sheetId: item.sheetId?.toString() ?? null,
      profileId: item.profileId?.toString() ?? null,
      materialName: item.materialName,
      thickness: item.thickness,
      sheetWidth: item.sheetWidth,
      sheetHeight: item.sheetHeight,
      profileType: item.profileType,
      profileLength: item.profileLength,
      profileDimensions: item.profileDimensions,
      baseMaterialPrice: item.baseMaterialPrice,
      isManualPrice: item.isManualPrice,
      isFullMaterial: item.isFullMaterial,
      materialCalcMode: item.materialCalcMode,
      // Nest CHAPA
      sheetCount: item.sheetCount,
      hasPartialLastSheet: item.hasPartialLastSheet,
      partialSheetWidth: item.partialSheetWidth,
      partialSheetHeight: item.partialSheetHeight,
      chargeFullLastSheet: item.chargeFullLastSheet,
      computedSheetUnits: item.computedSheetUnits,
      // Nest PERFIL
      profileBarCount: item.profileBarCount,
      hasPartialLastProfileBar: item.hasPartialLastProfileBar,
      partialProfileLength: item.partialProfileLength,
      chargeFullLastProfileBar: item.chargeFullLastProfileBar,
      computedProfileBarUnits: item.computedProfileBarUnits,
      scrapNotes: item.scrapNotes,
      // Geral
      isMaterialProvidedByClient: item.isMaterialProvidedByClient,
      cuttingGasId: item.cuttingGasId.toString(),
      cuttingTimeMinutes: item.cuttingTimeMinutes,
      cutWidth: item.cutWidth,
      cutHeight: item.cutHeight,
      cutLength: item.cutLength,
      usagePercentage: item.usagePercentage,
      setupRateId: item.setupRateId?.toString() ?? null,
      setupTimeMinutes: item.setupTimeMinutes,
      setupPricePerHour: item.setupPricePerHour,
      finishingDescription: item.finishingDescription,
      finishingPrice: item.finishingPrice,
      materialCost: item.materialCost,
      materialCharged: item.materialCharged,
      cuttingCost: item.cuttingCost,
      setupCost: item.setupCost,
      servicesCost: item.servicesCost,
      subtotalItemCost: item.subtotalItemCost,
      discountType: item.discountType,
      discountValue: item.discountValue,
      discountAmount: item.discountAmount,
      totalItemCost: item.totalItemCost,
      createdAt: item.createdAt,
      services: services.map(QuoteItemServicePresenter.toHTTP),
    }
  }
}
