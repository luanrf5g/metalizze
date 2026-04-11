import { Entity } from "@/core/entities/entity";
import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";
import { ProfileType } from "./profile";
import { DiscountType } from "./quote";

export type QuoteItemKind = 'SHEET' | 'PROFILE'

export interface QuoteItemProps {
  quoteId: UniqueEntityId
  partNumber: number
  itemKind: QuoteItemKind
  sheetId?: UniqueEntityId | null
  profileId?: UniqueEntityId | null
  materialName: string
  thickness: number
  sheetWidth?: number | null
  sheetHeight?: number | null
  profileType?: ProfileType | null
  profileLength?: number | null
  profileDimensions?: string | null
  baseMaterialPrice: number
  isManualPrice: boolean
  isFullMaterial: boolean
  cuttingGasId: UniqueEntityId
  cuttingTimeMinutes: number
  cutWidth?: number | null
  cutHeight?: number | null
  cutLength?: number | null
  usagePercentage?: number | null
  setupRateId?: UniqueEntityId | null
  setupTimeMinutes: number
  setupPricePerHour: number
  finishingDescription?: string | null
  finishingPrice: number
  materialCost: number
  cuttingCost: number
  setupCost: number
  servicesCost: number
  subtotalItemCost: number
  discountType?: DiscountType | null
  discountValue?: number | null
  discountAmount: number
  totalItemCost: number
  createdAt: Date
}

export class QuoteItem extends Entity<QuoteItemProps> {
  get quoteId() { return this.props.quoteId }
  get partNumber() { return this.props.partNumber }
  get itemKind() { return this.props.itemKind }
  get sheetId() { return this.props.sheetId ?? null }
  get profileId() { return this.props.profileId ?? null }
  get materialName() { return this.props.materialName }
  get thickness() { return this.props.thickness }
  get sheetWidth() { return this.props.sheetWidth ?? null }
  get sheetHeight() { return this.props.sheetHeight ?? null }
  get profileType() { return this.props.profileType ?? null }
  get profileLength() { return this.props.profileLength ?? null }
  get profileDimensions() { return this.props.profileDimensions ?? null }
  get baseMaterialPrice() { return this.props.baseMaterialPrice }
  get isManualPrice() { return this.props.isManualPrice }
  get isFullMaterial() { return this.props.isFullMaterial }
  get cuttingGasId() { return this.props.cuttingGasId }
  get cuttingTimeMinutes() { return this.props.cuttingTimeMinutes }
  get cutWidth() { return this.props.cutWidth ?? null }
  get cutHeight() { return this.props.cutHeight ?? null }
  get cutLength() { return this.props.cutLength ?? null }
  get usagePercentage() { return this.props.usagePercentage ?? null }
  get setupRateId() { return this.props.setupRateId ?? null }
  get setupTimeMinutes() { return this.props.setupTimeMinutes }
  get setupPricePerHour() { return this.props.setupPricePerHour }
  get finishingDescription() { return this.props.finishingDescription ?? null }
  get finishingPrice() { return this.props.finishingPrice }
  get materialCost() { return this.props.materialCost }
  get cuttingCost() { return this.props.cuttingCost }
  get setupCost() { return this.props.setupCost }
  get servicesCost() { return this.props.servicesCost }
  get subtotalItemCost() { return this.props.subtotalItemCost }
  get discountType() { return this.props.discountType ?? null }
  get discountValue() { return this.props.discountValue ?? null }
  get discountAmount() { return this.props.discountAmount }
  get totalItemCost() { return this.props.totalItemCost }
  get createdAt() { return this.props.createdAt }

  static create(
    props: Optional<
      QuoteItemProps,
      | 'createdAt'
      | 'isManualPrice'
      | 'isFullMaterial'
      | 'setupTimeMinutes'
      | 'setupPricePerHour'
      | 'finishingPrice'
      | 'materialCost'
      | 'cuttingCost'
      | 'setupCost'
      | 'servicesCost'
      | 'subtotalItemCost'
      | 'discountAmount'
      | 'totalItemCost'
    >,
    id?: UniqueEntityId
  ) {
    return new QuoteItem(
      {
        ...props,
        isManualPrice: props.isManualPrice ?? false,
        isFullMaterial: props.isFullMaterial ?? false,
        setupTimeMinutes: props.setupTimeMinutes ?? 0,
        setupPricePerHour: props.setupPricePerHour ?? 0,
        finishingPrice: props.finishingPrice ?? 0,
        materialCost: props.materialCost ?? 0,
        cuttingCost: props.cuttingCost ?? 0,
        setupCost: props.setupCost ?? 0,
        servicesCost: props.servicesCost ?? 0,
        subtotalItemCost: props.subtotalItemCost ?? 0,
        discountAmount: props.discountAmount ?? 0,
        totalItemCost: props.totalItemCost ?? 0,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )
  }
}
