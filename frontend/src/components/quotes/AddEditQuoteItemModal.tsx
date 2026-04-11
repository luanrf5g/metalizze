'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  fetchCuttingGases,
  fetchSetupRates,
  addQuoteItem,
  updateQuoteItem,
  type CuttingGasOption,
  type SetupRateOption,
} from '@/lib/quotes-api'
import type { QuoteDTO, QuoteItemDTO, QuoteItemKind, ProfileType, DiscountType, MaterialCalcMode } from '@/types/quote'

interface AddEditQuoteItemModalProps {
  open: boolean
  onClose: () => void
  quoteId: string
  item?: QuoteItemDTO | null
  onSaved: (quote: QuoteDTO) => void
}

type FormState = {
  itemKind: QuoteItemKind
  materialName: string
  thickness: string
  sheetWidth: string
  sheetHeight: string
  profileType: ProfileType | ''
  profileLength: string
  profileDimensions: string
  baseMaterialPrice: string
  isManualPrice: boolean
  isFullMaterial: boolean
  materialCalcMode: MaterialCalcMode
  usagePercentage: string
  // Nest / sheet fields (SHEET only)
  sheetCount: string
  hasPartialLastSheet: boolean
  chargeFullLastSheet: boolean
  partialSheetWidth: string
  partialSheetHeight: string
  isMaterialProvidedByClient: boolean
  // Nest / bar fields (PROFILE only)
  profileBarCount: string
  hasPartialLastProfileBar: boolean
  chargeFullLastProfileBar: boolean
  partialProfileLength: string
  scrapNotes: string
  cuttingGasId: string
  cuttingTimeMinutes: string
  cutWidth: string
  cutHeight: string
  cutLength: string
  setupRateId: string
  setupTimeMinutes: string
  setupPricePerHour: string
  finishingDescription: string
  finishingPrice: string
  discountType: DiscountType | ''
  discountValue: string
}

function defaultForm(item?: QuoteItemDTO | null): FormState {
  if (item) {
    return {
      itemKind: item.itemKind,
      materialName: item.materialName,
      thickness: String(item.thickness),
      sheetWidth: item.sheetWidth != null ? String(item.sheetWidth) : '',
      sheetHeight: item.sheetHeight != null ? String(item.sheetHeight) : '',
      profileType: (item.profileType as ProfileType) ?? '',
      profileLength: item.profileLength != null ? String(item.profileLength) : '',
      profileDimensions: item.profileDimensions ?? '',
      baseMaterialPrice: String(item.baseMaterialPrice),
      isManualPrice: item.isManualPrice,
      isFullMaterial: item.isFullMaterial,
      materialCalcMode: item.materialCalcMode ?? 'NEST_UNITS',
      usagePercentage: item.usagePercentage != null ? String(item.usagePercentage) : '',
      sheetCount: String(item.sheetCount ?? 1),
      hasPartialLastSheet: item.hasPartialLastSheet ?? false,
      chargeFullLastSheet: item.chargeFullLastSheet ?? false,
      partialSheetWidth: item.partialSheetWidth != null ? String(item.partialSheetWidth) : '',
      partialSheetHeight: item.partialSheetHeight != null ? String(item.partialSheetHeight) : '',
      isMaterialProvidedByClient: item.isMaterialProvidedByClient ?? false,
      profileBarCount: String(item.profileBarCount ?? 1),
      hasPartialLastProfileBar: item.hasPartialLastProfileBar ?? false,
      chargeFullLastProfileBar: item.chargeFullLastProfileBar ?? false,
      partialProfileLength: item.partialProfileLength != null ? String(item.partialProfileLength) : '',
      scrapNotes: item.scrapNotes ?? '',
      cuttingGasId: item.cuttingGasId,
      cuttingTimeMinutes: String(item.cuttingTimeMinutes),
      cutWidth: item.cutWidth != null ? String(item.cutWidth) : '',
      cutHeight: item.cutHeight != null ? String(item.cutHeight) : '',
      cutLength: item.cutLength != null ? String(item.cutLength) : '',
      setupRateId: item.setupRateId ?? '',
      setupTimeMinutes: String(item.setupTimeMinutes),
      setupPricePerHour: String(item.setupPricePerHour),
      finishingDescription: item.finishingDescription ?? '',
      finishingPrice: String(item.finishingPrice),
      discountType: (item.discountType as DiscountType) ?? '',
      discountValue: item.discountValue != null ? String(item.discountValue) : '',
    }
  }
  return {
    itemKind: 'SHEET',
    materialName: '',
    thickness: '',
    sheetWidth: '',
    sheetHeight: '',
    profileType: '',
    profileLength: '',
    profileDimensions: '',
    baseMaterialPrice: '',
    isManualPrice: false,
    isFullMaterial: false,
    materialCalcMode: 'NEST_UNITS',
    usagePercentage: '',
    sheetCount: '1',
    hasPartialLastSheet: false,
    chargeFullLastSheet: false,
    partialSheetWidth: '',
    partialSheetHeight: '',
    isMaterialProvidedByClient: false,
    profileBarCount: '1',
    hasPartialLastProfileBar: false,
    chargeFullLastProfileBar: false,
    partialProfileLength: '',
    scrapNotes: '',
    cuttingGasId: '',
    cuttingTimeMinutes: '',
    cutWidth: '',
    cutHeight: '',
    cutLength: '',
    setupRateId: '',
    setupTimeMinutes: '0',
    setupPricePerHour: '0',
    finishingDescription: '',
    finishingPrice: '0',
    discountType: '',
    discountValue: '',
  }
}

const PROFILE_TYPE_LABELS: Record<ProfileType, string> = {
  SQUARE: 'Quadrado',
  RECTANGULAR: 'Retangular',
  ROUND: 'Redondo',
  OBLONG: 'Oblongo',
  ANGLE: 'Cantoneira',
  U_CHANNEL: 'Perfil U',
}

export function AddEditQuoteItemModal({
  open,
  onClose,
  quoteId,
  item,
  onSaved,
}: AddEditQuoteItemModalProps) {
  const [form, setForm] = useState<FormState>(() => defaultForm(item))
  const [gases, setGases] = useState<CuttingGasOption[]>([])
  const [setupRates, setSetupRates] = useState<SetupRateOption[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(defaultForm(item))
      fetchCuttingGases().then(setGases).catch(() => {})
      fetchSetupRates().then(setSetupRates).catch(() => {})
    }
  }, [open, item])

  // Sync setupPricePerHour when setupRateId changes (pre-fill from rate)
  useEffect(() => {
    if (form.setupRateId) {
      const rate = setupRates.find((r) => r.id === form.setupRateId)
      if (rate) {
        setForm((f) => ({ ...f, setupPricePerHour: String(rate.pricePerHour) }))
      }
    }
  }, [form.setupRateId, setupRates])

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.materialName.trim()) { toast.error('Nome do material é obrigatório.'); return }
    if (!form.thickness) { toast.error('Espessura é obrigatória.'); return }
    if (!form.baseMaterialPrice) { toast.error('Preço base do material é obrigatório.'); return }
    if (!form.cuttingGasId) { toast.error('Selecione um gás de corte.'); return }
    if (!form.cuttingTimeMinutes) { toast.error('Tempo de corte é obrigatório.'); return }

    setIsSaving(true)
    try {
      const sheetCountNum = parseInt(form.sheetCount) || 1
      const profileBarCountNum = parseInt(form.profileBarCount) || 1
      const payload = {
        itemKind: form.itemKind,
        materialName: form.materialName.trim(),
        thickness: parseFloat(form.thickness),
        sheetWidth: form.itemKind === 'SHEET' && form.sheetWidth ? parseFloat(form.sheetWidth) : null,
        sheetHeight: form.itemKind === 'SHEET' && form.sheetHeight ? parseFloat(form.sheetHeight) : null,
        profileType: form.itemKind === 'PROFILE' && form.profileType ? form.profileType as ProfileType : null,
        profileLength: form.itemKind === 'PROFILE' && form.profileLength ? parseFloat(form.profileLength) : null,
        profileDimensions: form.itemKind === 'PROFILE' && form.profileDimensions ? form.profileDimensions : null,
        baseMaterialPrice: parseFloat(form.baseMaterialPrice),
        isManualPrice: form.isManualPrice,
        isFullMaterial: form.isFullMaterial,
        materialCalcMode: form.materialCalcMode,
        usagePercentage: null,
        ...(form.itemKind === 'SHEET' ? {
          sheetCount: sheetCountNum,
          hasPartialLastSheet: form.hasPartialLastSheet,
          chargeFullLastSheet: form.chargeFullLastSheet,
          partialSheetWidth: form.hasPartialLastSheet && !form.chargeFullLastSheet && form.partialSheetWidth ? parseFloat(form.partialSheetWidth) : null,
          partialSheetHeight: form.hasPartialLastSheet && !form.chargeFullLastSheet && form.partialSheetHeight ? parseFloat(form.partialSheetHeight) : null,
          isMaterialProvidedByClient: form.isMaterialProvidedByClient,
        } : {
          profileBarCount: profileBarCountNum,
          hasPartialLastProfileBar: form.hasPartialLastProfileBar,
          chargeFullLastProfileBar: form.chargeFullLastProfileBar,
          partialProfileLength: form.hasPartialLastProfileBar && !form.chargeFullLastProfileBar && form.partialProfileLength ? parseFloat(form.partialProfileLength) : null,
          scrapNotes: form.scrapNotes.trim() || null,
          isMaterialProvidedByClient: form.isMaterialProvidedByClient,
        }),
        cuttingGasId: form.cuttingGasId,
        cuttingTimeMinutes: parseFloat(form.cuttingTimeMinutes),
        cutWidth: form.itemKind === 'SHEET' && form.materialCalcMode === 'SIMPLE_CUT' && form.cutWidth ? parseFloat(form.cutWidth) : null,
        cutHeight: form.itemKind === 'SHEET' && form.materialCalcMode === 'SIMPLE_CUT' && form.cutHeight ? parseFloat(form.cutHeight) : null,
        cutLength: form.itemKind === 'PROFILE' && form.materialCalcMode === 'SIMPLE_CUT' && form.cutLength ? parseFloat(form.cutLength) : null,
        setupRateId: form.setupRateId || null,
        setupTimeMinutes: parseFloat(form.setupTimeMinutes) || 0,
        setupPricePerHour: parseFloat(form.setupPricePerHour) || 0,
        finishingDescription: form.finishingDescription.trim() || null,
        finishingPrice: parseFloat(form.finishingPrice) || 0,
        discountType: (form.discountType as DiscountType) || null,
        discountValue: form.discountValue ? parseFloat(form.discountValue) : null,
      }

      let quote: QuoteDTO
      if (item) {
        quote = await updateQuoteItem(quoteId, item.id, payload)
        toast.success('Item atualizado com sucesso!')
      } else {
        quote = await addQuoteItem(quoteId, payload)
        toast.success('Item adicionado com sucesso!')
      }
      onSaved(quote)
      onClose()
    } catch {
      toast.error('Erro ao salvar o item.')
    } finally {
      setIsSaving(false)
    }
  }

  const isSheet = form.itemKind === 'SHEET'

  // Live preview of computed sheet units (SHEET only)
  const previewSheetUnits = (() => {
    if (!isSheet) return 0
    const sc = parseInt(form.sheetCount) || 1
    if (form.isFullMaterial) return sc
    if (form.materialCalcMode === 'SIMPLE_CUT') {
      const cw = parseFloat(form.cutWidth) || 0
      const ch = parseFloat(form.cutHeight) || 0
      const sw = parseFloat(form.sheetWidth) || 0
      const sh = parseFloat(form.sheetHeight) || 0
      if (cw > 0 && ch > 0 && sw > 0 && sh > 0) return Math.min(1, (cw * ch) / (sw * sh))
      return 1
    }
    // NEST_UNITS
    if (form.hasPartialLastSheet && form.chargeFullLastSheet) return sc
    if (form.hasPartialLastSheet && !form.chargeFullLastSheet) {
      const pw = parseFloat(form.partialSheetWidth) || 0
      const ph = parseFloat(form.partialSheetHeight) || 0
      const sw = parseFloat(form.sheetWidth) || 0
      const sh = parseFloat(form.sheetHeight) || 0
      if (sw > 0 && sh > 0) {
        const ratio = (pw * ph) / (sw * sh)
        return (sc - 1) + ratio
      }
    }
    return sc
  })()
  const previewMaterialCost = (parseFloat(form.baseMaterialPrice) || 0) * previewSheetUnits
  const previewMaterialCharged = form.isMaterialProvidedByClient ? 0 : previewMaterialCost

  // Live preview of computed profile bar units (PROFILE only)
  const previewProfileBarUnits = (() => {
    if (isSheet) return 0
    const bc = parseInt(form.profileBarCount) || 1
    if (form.isFullMaterial) return bc
    if (form.materialCalcMode === 'SIMPLE_CUT') {
      const cl = parseFloat(form.cutLength) || 0
      const pl = parseFloat(form.profileLength) || 0
      if (cl > 0 && pl > 0) return Math.min(1, cl / pl)
      return 1
    }
    // NEST_UNITS
    if (form.hasPartialLastProfileBar && form.chargeFullLastProfileBar) return bc
    if (form.hasPartialLastProfileBar && !form.chargeFullLastProfileBar) {
      const pp = parseFloat(form.partialProfileLength) || 0
      const pl = parseFloat(form.profileLength) || 0
      if (pl > 0) return (bc - 1) + Math.min(1, pp / pl)
    }
    return bc
  })()
  const previewProfileMaterialCost = (parseFloat(form.baseMaterialPrice) || 0) * previewProfileBarUnits
  const previewProfileMaterialCharged = form.isMaterialProvidedByClient ? 0 : previewProfileMaterialCost

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? 'Editar Item' : 'Adicionar Item'}</DialogTitle>
          <DialogDescription>
            Preencha os dados do item de orçamento.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {/* Kind */}
          <div className="space-y-2">
            <Label>Tipo de Item</Label>
            <Select
              value={form.itemKind}
              onValueChange={(v) => update('itemKind', v as QuoteItemKind)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SHEET">Chapa</SelectItem>
                <SelectItem value="PROFILE">Perfil</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Material */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="materialName">Material *</Label>
              <Input
                id="materialName"
                placeholder="Ex.: Aço Carbono"
                value={form.materialName}
                onChange={(e) => update('materialName', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="thickness">Espessura (mm) *</Label>
              <Input
                id="thickness"
                type="number"
                min="0"
                step="0.01"
                placeholder="3"
                value={form.thickness}
                onChange={(e) => update('thickness', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Sheet-specific dims */}
          {isSheet && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="sheetWidth">Largura da chapa (mm)</Label>
                <Input
                  id="sheetWidth"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="1000"
                  value={form.sheetWidth}
                  onChange={(e) => update('sheetWidth', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sheetHeight">Altura da chapa (mm)</Label>
                <Input
                  id="sheetHeight"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="2000"
                  value={form.sheetHeight}
                  onChange={(e) => update('sheetHeight', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Profile-specific dims */}
          {!isSheet && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Tipo de Perfil</Label>
                <Select
                  value={form.profileType || 'none'}
                  onValueChange={(v) => update('profileType', v === 'none' ? '' : v as ProfileType)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecionar…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">—</SelectItem>
                    {(Object.entries(PROFILE_TYPE_LABELS) as [ProfileType, string][]).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="profileLength">Comprimento (mm)</Label>
                <Input
                  id="profileLength"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.profileLength}
                  onChange={(e) => update('profileLength', e.target.value)}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="profileDimensions">Dimensões (texto)</Label>
                <Input
                  id="profileDimensions"
                  placeholder="Ex.: 50x50"
                  value={form.profileDimensions}
                  onChange={(e) => update('profileDimensions', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-3 items-end">
            <div className="space-y-2">
              <Label htmlFor="baseMaterialPrice">Preço base do material (R$) *</Label>
              <Input
                id="baseMaterialPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="200.00"
                value={form.baseMaterialPrice}
                onChange={(e) => update('baseMaterialPrice', e.target.value)}
                required
              />
            </div>
            <div className="flex items-center gap-2 pb-1">
              <Switch
                id="isManualPrice"
                checked={form.isManualPrice}
                onCheckedChange={(v) => update('isManualPrice', v)}
              />
              <Label htmlFor="isManualPrice">Preço manual</Label>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="isFullMaterial"
              checked={form.isFullMaterial}
              onCheckedChange={(v) => update('isFullMaterial', v)}
            />
            <Label htmlFor="isFullMaterial">Material inteiro</Label>
          </div>

          {/* Nest / Sheet info (SHEET only) */}
          {isSheet && (
            <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cálculo da Chapa</p>

              <div className="space-y-2">
                <Label>Modo de cálculo</Label>
                <Select
                  value={form.materialCalcMode}
                  onValueChange={(v) => update('materialCalcMode', v as MaterialCalcMode)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEST_UNITS">Por nest (chapas)</SelectItem>
                    <SelectItem value="SIMPLE_CUT">Corte simples (área)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {!form.isFullMaterial && form.materialCalcMode === 'SIMPLE_CUT' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="scutWidth">Largura do corte (mm)</Label>
                    <Input
                      id="scutWidth"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.cutWidth}
                      onChange={(e) => update('cutWidth', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scutHeight">Altura do corte (mm)</Label>
                    <Input
                      id="scutHeight"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.cutHeight}
                      onChange={(e) => update('cutHeight', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {!form.isFullMaterial && form.materialCalcMode === 'NEST_UNITS' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="sheetCount">Nº de chapas no nest</Label>
                    <Input
                      id="sheetCount"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="1"
                      value={form.sheetCount}
                      onChange={(e) => update('sheetCount', e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      id="hasPartialLastSheet"
                      checked={form.hasPartialLastSheet}
                      onCheckedChange={(v) => {
                        update('hasPartialLastSheet', v)
                        if (!v) { update('chargeFullLastSheet', false); update('partialSheetWidth', ''); update('partialSheetHeight', '') }
                      }}
                    />
                    <Label htmlFor="hasPartialLastSheet">Última chapa parcial</Label>
                  </div>

                  {form.hasPartialLastSheet && (
                    <>
                      <div className="flex items-center gap-2 ml-6">
                        <Switch
                          id="chargeFullLastSheet"
                          checked={form.chargeFullLastSheet}
                          onCheckedChange={(v) => update('chargeFullLastSheet', v)}
                        />
                        <Label htmlFor="chargeFullLastSheet">Cobrar última chapa inteira</Label>
                      </div>

                      {!form.chargeFullLastSheet && (
                        <div className="grid grid-cols-2 gap-3 ml-6">
                          <div className="space-y-2">
                            <Label htmlFor="partialSheetWidth">Largura usada (mm)</Label>
                            <Input
                              id="partialSheetWidth"
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="700"
                              value={form.partialSheetWidth}
                              onChange={(e) => update('partialSheetWidth', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="partialSheetHeight">Altura usada (mm)</Label>
                            <Input
                              id="partialSheetHeight"
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="1000"
                              value={form.partialSheetHeight}
                              onChange={(e) => update('partialSheetHeight', e.target.value)}
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              <div className="flex items-center gap-2">
                <Switch
                  id="isMaterialProvidedByClient"
                  checked={form.isMaterialProvidedByClient}
                  onCheckedChange={(v) => update('isMaterialProvidedByClient', v)}
                />
                <Label htmlFor="isMaterialProvidedByClient">Material fornecido pelo cliente</Label>
              </div>

              {/* Preview */}
              <div className="rounded-md bg-background border p-3 text-xs space-y-1 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Chapas cobradas:</span>
                  <span className="font-mono text-foreground">{previewSheetUnits.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Material (referência):</span>
                  <span className="font-mono text-foreground">
                    {previewMaterialCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Material cobrado:</span>
                  <span className={`font-mono ${form.isMaterialProvidedByClient ? 'text-green-600 dark:text-green-400' : 'text-foreground'}`}>
                    {previewMaterialCharged.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Cálculo do Perfil (PROFILE only) */}
          {!isSheet && (
            <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cálculo do Perfil</p>

              <div className="space-y-2">
                <Label>Modo de cálculo</Label>
                <Select
                  value={form.materialCalcMode}
                  onValueChange={(v) => update('materialCalcMode', v as MaterialCalcMode)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEST_UNITS">Por barras</SelectItem>
                    <SelectItem value="SIMPLE_CUT">Corte simples (comprimento)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {!form.isFullMaterial && form.materialCalcMode === 'SIMPLE_CUT' && (
                <div className="space-y-2">
                  <Label htmlFor="cutLength">Comprimento do corte (mm)</Label>
                  <Input
                    id="cutLength"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.cutLength}
                    onChange={(e) => update('cutLength', e.target.value)}
                  />
                </div>
              )}

              {!form.isFullMaterial && form.materialCalcMode === 'NEST_UNITS' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="profileBarCount">Nº de barras no nest</Label>
                    <Input
                      id="profileBarCount"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="1"
                      value={form.profileBarCount}
                      onChange={(e) => update('profileBarCount', e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      id="hasPartialLastProfileBar"
                      checked={form.hasPartialLastProfileBar}
                      onCheckedChange={(v) => {
                        update('hasPartialLastProfileBar', v)
                        if (!v) { update('chargeFullLastProfileBar', false); update('partialProfileLength', '') }
                      }}
                    />
                    <Label htmlFor="hasPartialLastProfileBar">Última barra parcial</Label>
                  </div>

                  {form.hasPartialLastProfileBar && (
                    <>
                      <div className="flex items-center gap-2 ml-6">
                        <Switch
                          id="chargeFullLastProfileBar"
                          checked={form.chargeFullLastProfileBar}
                          onCheckedChange={(v) => update('chargeFullLastProfileBar', v)}
                        />
                        <Label htmlFor="chargeFullLastProfileBar">Cobrar última barra inteira</Label>
                      </div>

                      {!form.chargeFullLastProfileBar && (
                        <div className="ml-6 space-y-2">
                          <Label htmlFor="partialProfileLength">Comprimento usado (mm)</Label>
                          <Input
                            id="partialProfileLength"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="600"
                            value={form.partialProfileLength}
                            onChange={(e) => update('partialProfileLength', e.target.value)}
                          />
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="scrapNotes">Observações de sobras (opcional)</Label>
                <Input
                  id="scrapNotes"
                  placeholder="Ex.: Sobra para estoque B"
                  value={form.scrapNotes}
                  onChange={(e) => update('scrapNotes', e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="isMaterialProvidedByClientProfile"
                  checked={form.isMaterialProvidedByClient}
                  onCheckedChange={(v) => update('isMaterialProvidedByClient', v)}
                />
                <Label htmlFor="isMaterialProvidedByClientProfile">Material fornecido pelo cliente</Label>
              </div>

              {/* Preview */}
              <div className="rounded-md bg-background border p-3 text-xs space-y-1 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Barras cobradas:</span>
                  <span className="font-mono text-foreground">{previewProfileBarUnits.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Material (referência):</span>
                  <span className="font-mono text-foreground">
                    {previewProfileMaterialCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Material cobrado:</span>
                  <span className={`font-mono ${form.isMaterialProvidedByClient ? 'text-green-600 dark:text-green-400' : 'text-foreground'}`}>
                    {previewProfileMaterialCharged.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Cutting */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Gás de Corte *</Label>
              <Select
                value={form.cuttingGasId || 'none'}
                onValueChange={(v) => update('cuttingGasId', v === 'none' ? '' : v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecionar…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">—</SelectItem>
                  {gases.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name} (R$&nbsp;{g.pricePerHour.toFixed(2)}/h)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cuttingTimeMinutes">Tempo de corte (min) *</Label>
              <Input
                id="cuttingTimeMinutes"
                type="number"
                min="0"
                step="0.1"
                placeholder="30"
                value={form.cuttingTimeMinutes}
                onChange={(e) => update('cuttingTimeMinutes', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Setup */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Setup Rate (opcional)</Label>
              <Select
                value={form.setupRateId || 'none'}
                onValueChange={(v) => update('setupRateId', v === 'none' ? '' : v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Nenhum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {setupRates.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name} (R$&nbsp;{r.pricePerHour.toFixed(2)}/h)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="setupTimeMinutes">Tempo de setup (min)</Label>
              <Input
                id="setupTimeMinutes"
                type="number"
                min="0"
                step="0.1"
                value={form.setupTimeMinutes}
                onChange={(e) => update('setupTimeMinutes', e.target.value)}
              />
            </div>
          </div>

          {/* Finishing */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="finishingDescription">Acabamento (opcional)</Label>
              <Input
                id="finishingDescription"
                placeholder="Ex.: Pintura"
                value={form.finishingDescription}
                onChange={(e) => update('finishingDescription', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="finishingPrice">Preço do acabamento (R$)</Label>
              <Input
                id="finishingPrice"
                type="number"
                min="0"
                step="0.01"
                value={form.finishingPrice}
                onChange={(e) => update('finishingPrice', e.target.value)}
              />
            </div>
          </div>

          {/* Item discount */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Desconto do item</Label>
              <Select
                value={form.discountType || 'none'}
                onValueChange={(v) => {
                  update('discountType', v === 'none' ? '' : v as DiscountType)
                  if (v === 'none') update('discountValue', '')
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sem desconto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem desconto</SelectItem>
                  <SelectItem value="PERCENT">Percentual (%)</SelectItem>
                  <SelectItem value="AMOUNT">Valor fixo (R$)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="itemDiscountValue">Valor</Label>
              <Input
                id="itemDiscountValue"
                type="number"
                min="0"
                step="0.01"
                value={form.discountValue}
                onChange={(e) => update('discountValue', e.target.value)}
                disabled={!form.discountType}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Salvando…' : item ? 'Salvar Alterações' : 'Adicionar Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
