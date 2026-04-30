export type QuoteStatus = 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED' | 'EXPIRED'
export type DiscountType = 'PERCENT' | 'AMOUNT'
export type QuoteType = 'CUTTING' | 'SALE'
export type QuoteItemKind = 'SHEET' | 'PROFILE'
export type ProfileType = 'SQUARE' | 'RECTANGULAR' | 'ROUND' | 'OBLONG' | 'ANGLE' | 'U_CHANNEL'
export type MaterialCalcMode = 'SIMPLE_CUT' | 'NEST_UNITS'
export type QuotesSortBy = 'createdAt' | 'updatedAt' | 'totalQuote' | 'code'
export type QuotesSortOrder = 'asc' | 'desc'

export interface MetaDTO {
  page: number
  perPage: number
  total: number
  totalPages: number
}

export interface QuoteItemServiceDTO {
  id: string
  serviceId: string
  serviceName: string | null
  unitLabel: string | null
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface QuoteItemDTO {
  id: string
  quoteId: string
  partNumber: number
  itemKind: QuoteItemKind
  sheetId: string | null
  profileId: string | null
  materialName: string
  thickness: number
  sheetWidth: number | null
  sheetHeight: number | null
  profileType: ProfileType | null
  profileLength: number | null
  profileDimensions: string | null
  baseMaterialPrice: number
  isManualPrice: boolean
  isFullMaterial: boolean
  materialCalcMode: MaterialCalcMode
  sheetCount: number
  hasPartialLastSheet: boolean
  partialSheetWidth: number | null
  partialSheetHeight: number | null
  chargeFullLastSheet: boolean
  computedSheetUnits: number
  profileBarCount: number
  hasPartialLastProfileBar: boolean
  partialProfileLength: number | null
  chargeFullLastProfileBar: boolean
  computedProfileBarUnits: number
  scrapNotes: string | null
  isMaterialProvidedByClient: boolean
  cuttingGasId: string
  cuttingTimeMinutes: number
  chargeMinimumCutting: boolean
  effectiveCuttingTimeMinutes?: number
  cutWidth: number | null
  cutHeight: number | null
  cutLength: number | null
  usagePercentage: number | null
  setupRateId: string | null
  setupTimeMinutes: number
  setupPricePerHour: number
  finishingDescription: string | null
  finishingPrice: number
  materialCost: number
  materialCharged: number
  cuttingCost: number
  setupCost: number
  servicesCost: number
  subtotalItemCost: number
  discountType: DiscountType | null
  discountValue: number | null
  discountAmount: number
  totalItemCost: number
  createdAt: string
  services: QuoteItemServiceDTO[]
}

export interface QuoteDTO {
  id: string
  code: string
  status: QuoteStatus
  revision: number
  clientId: string | null
  notes: string | null
  validUntil: string | null
  totalMaterial: number
  totalCutting: number
  totalSetup: number
  totalServices: number
  subtotalQuote: number
  discountType: DiscountType | null
  discountValue: number | null
  discountAmount: number
  totalQuote: number  quoteType: QuoteType
  saleMarkupType: DiscountType | null
  saleMarkupValue: number | null
  totalCost: number
  saleMarkupAmount: number
  totalSale: number  sentAt: string | null
  approvedAt: string | null
  rejectedAt: string | null
  expiredAt: string | null
  createdById: string
  createdAt: string
  updatedAt: string | null
  items?: QuoteItemDTO[]
  client?: { id: string; name: string } | null
  createdBy?: { id: string; name: string }
}
