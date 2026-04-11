import { api } from './api'
import type { QuoteDTO, QuoteStatus, DiscountType, QuoteItemKind, ProfileType, MaterialCalcMode } from '@/types/quote'

/* ── Quote CRUD ─────────────────────────────────────────────── */

export interface CreateQuoteInput {
  clientId?: string | null
  notes?: string | null
  validUntil?: string | null
  discountType?: DiscountType | null
  discountValue?: number | null
}

export async function createQuote(input: CreateQuoteInput): Promise<QuoteDTO> {
  const res = await api.post('/quotes', input)
  return res.data.quote
}

export interface FetchQuotesParams {
  page?: number
  status?: QuoteStatus | null
  clientId?: string | null
}

export async function fetchQuotes(params: FetchQuotesParams = {}): Promise<QuoteDTO[]> {
  const res = await api.get('/quotes', { params })
  return res.data.quotes
}

export async function getQuoteById(id: string): Promise<QuoteDTO> {
  const res = await api.get(`/quotes/${id}`)
  return res.data.quote
}

export interface UpdateQuoteInput {
  clientId?: string | null
  notes?: string | null
  validUntil?: string | null
  discountType?: DiscountType | null
  discountValue?: number | null
}

export async function updateQuote(id: string, input: UpdateQuoteInput): Promise<QuoteDTO> {
  const res = await api.patch(`/quotes/${id}`, input)
  return res.data.quote
}

export async function transitionQuoteStatus(id: string, status: QuoteStatus): Promise<QuoteDTO> {
  const res = await api.patch(`/quotes/${id}/status`, { status })
  return res.data.quote
}

/* ── Item CRUD ───────────────────────────────────────────────── */

export interface AddQuoteItemInput {
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
  usagePercentage?: number | null
  sheetCount?: number
  hasPartialLastSheet?: boolean
  partialSheetWidth?: number | null
  partialSheetHeight?: number | null
  chargeFullLastSheet?: boolean
  profileBarCount?: number
  hasPartialLastProfileBar?: boolean
  partialProfileLength?: number | null
  chargeFullLastProfileBar?: boolean
  scrapNotes?: string | null
  isMaterialProvidedByClient?: boolean
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
  services?: Array<{ serviceId: string; quantity: number; unitPrice?: number }>
}

export async function addQuoteItem(quoteId: string, input: AddQuoteItemInput): Promise<QuoteDTO> {
  const res = await api.post(`/quotes/${quoteId}/items`, input)
  return res.data.quote
}

export type UpdateQuoteItemInput = Partial<AddQuoteItemInput>

export async function updateQuoteItem(
  quoteId: string,
  itemId: string,
  input: UpdateQuoteItemInput,
): Promise<QuoteDTO> {
  const res = await api.patch(`/quotes/${quoteId}/items/${itemId}`, input)
  return res.data.quote
}

export async function deleteQuoteItem(quoteId: string, itemId: string): Promise<QuoteDTO> {
  const res = await api.delete(`/quotes/${quoteId}/items/${itemId}`)
  return res.data.quote
}

export async function replaceQuoteItemServices(
  quoteId: string,
  itemId: string,
  services: Array<{ serviceId: string; quantity: number; unitPrice?: number }>,
): Promise<QuoteDTO> {
  const res = await api.put(`/quotes/${quoteId}/items/${itemId}/services`, { services })
  return res.data.quote
}

/* ── Config selects ──────────────────────────────────────────── */

export interface CuttingGasOption {
  id: string
  name: string
  pricePerHour: number
  isActive: boolean
}

export async function fetchCuttingGases(): Promise<CuttingGasOption[]> {
  const res = await api.get('/cutting-gases')
  return (res.data.cuttingGases ?? []).filter((g: CuttingGasOption) => g.isActive)
}

export interface SetupRateOption {
  id: string
  name: string
  pricePerHour: number
  isActive: boolean
}

export async function fetchSetupRates(): Promise<SetupRateOption[]> {
  const res = await api.get('/setup-rates')
  return (res.data.setupRates ?? []).filter((s: SetupRateOption) => s.isActive)
}

export interface AdditionalServiceOption {
  id: string
  name: string
  unitLabel: string
  pricePerUnit: number
  isActive: boolean
}

export async function fetchAdditionalServices(): Promise<AdditionalServiceOption[]> {
  const res = await api.get('/additional-services')
  return (res.data.additionalServices ?? []).filter((s: AdditionalServiceOption) => s.isActive)
}
