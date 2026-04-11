import { InMemoryQuotesRepository } from 'test/repositories/in-memory-quotes-repository'
import { InMemoryCuttingGasRepository } from 'test/repositories/in-memory-cutting-gas-repository'
import { AddQuoteItemUseCase } from './add-quote-item'
import { CalculateQuoteTotalsUseCase } from './calculate-quote-totals'
import { makeQuote } from 'test/factories/make-quote'
import { makeCuttingGas } from 'test/factories/make-cutting-gas'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

let quotesRepository: InMemoryQuotesRepository
let cuttingGasRepository: InMemoryCuttingGasRepository
let calculateTotals: CalculateQuoteTotalsUseCase
let sut: AddQuoteItemUseCase

describe('Add Quote Item Use Case', () => {
  beforeEach(() => {
    quotesRepository = new InMemoryQuotesRepository()
    cuttingGasRepository = new InMemoryCuttingGasRepository()
    calculateTotals = new CalculateQuoteTotalsUseCase(quotesRepository)
    sut = new AddQuoteItemUseCase(quotesRepository, cuttingGasRepository, calculateTotals)
  })

  it('should be able to add a sheet item with full material price', async () => {
    const cuttingGas = makeCuttingGas({ pricePerHour: 60 })
    await cuttingGasRepository.create(cuttingGas)

    const quote = makeQuote()
    await quotesRepository.create(quote)

    const result = await sut.execute({
      quoteId: quote.id.toString(),
      itemKind: 'SHEET',
      materialName: 'Aço Carbono',
      thickness: 3,
      baseMaterialPrice: 200,
      isFullMaterial: true,
      cuttingGasId: cuttingGas.id.toString(),
      cuttingTimeMinutes: 30,
    })

    expect(result.isRight()).toBe(true)
    expect(quotesRepository.quoteItems).toHaveLength(1)

    if (result.isRight()) {
      const { item } = result.value
      // materialCost = 200 (full material)
      expect(item.materialCost).toBe(200)
      // cuttingCost = (30 / 60) * 60 = 30
      expect(item.cuttingCost).toBe(30)
      expect(item.subtotalItemCost).toBe(230)
      expect(item.totalItemCost).toBe(230)
      expect(item.discountAmount).toBe(0)
      expect(item.partNumber).toBe(1)
    }
  })

  it('should calculate material cost using usagePercentage when not full material', async () => {
    const cuttingGas = makeCuttingGas({ pricePerHour: 60 })
    await cuttingGasRepository.create(cuttingGas)

    const quote = makeQuote()
    await quotesRepository.create(quote)

    const result = await sut.execute({
      quoteId: quote.id.toString(),
      itemKind: 'SHEET',
      materialName: 'Alumínio',
      thickness: 2,
      baseMaterialPrice: 100,
      isFullMaterial: false,
      usagePercentage: 50,
      cuttingGasId: cuttingGas.id.toString(),
      cuttingTimeMinutes: 60,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      // materialCost = 100 * 50% = 50
      // cuttingCost = (60/60) * 60 = 60
      expect(result.value.item.materialCost).toBe(50)
      expect(result.value.item.cuttingCost).toBe(60)
      expect(result.value.item.subtotalItemCost).toBe(110)
    }
  })

  it('should fallback to full baseMaterialPrice when not full material and no usagePercentage', async () => {
    const cuttingGas = makeCuttingGas({ pricePerHour: 0 })
    await cuttingGasRepository.create(cuttingGas)

    const quote = makeQuote()
    await quotesRepository.create(quote)

    const result = await sut.execute({
      quoteId: quote.id.toString(),
      itemKind: 'SHEET',
      materialName: 'Inox',
      thickness: 1,
      baseMaterialPrice: 300,
      isFullMaterial: false,
      cuttingGasId: cuttingGas.id.toString(),
      cuttingTimeMinutes: 0,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.item.materialCost).toBe(300)
    }
  })

  it('should include setup cost when setupTimeMinutes and setupPricePerHour are provided', async () => {
    const cuttingGas = makeCuttingGas({ pricePerHour: 0 })
    await cuttingGasRepository.create(cuttingGas)

    const quote = makeQuote()
    await quotesRepository.create(quote)

    const result = await sut.execute({
      quoteId: quote.id.toString(),
      itemKind: 'SHEET',
      materialName: 'Aço',
      thickness: 3,
      baseMaterialPrice: 0,
      cuttingGasId: cuttingGas.id.toString(),
      cuttingTimeMinutes: 0,
      setupTimeMinutes: 30,
      setupPricePerHour: 120,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      // setupCost = (30/60) * 120 = 60
      expect(result.value.item.setupCost).toBe(60)
    }
  })

  it('should include services cost and create QuoteItemService entries', async () => {
    const cuttingGas = makeCuttingGas({ pricePerHour: 0 })
    await cuttingGasRepository.create(cuttingGas)

    const quote = makeQuote()
    await quotesRepository.create(quote)

    const serviceId = new UniqueEntityId().toString()

    const result = await sut.execute({
      quoteId: quote.id.toString(),
      itemKind: 'SHEET',
      materialName: 'Aço',
      thickness: 3,
      baseMaterialPrice: 0,
      cuttingGasId: cuttingGas.id.toString(),
      cuttingTimeMinutes: 0,
      services: [
        { serviceId, quantity: 2, unitPrice: 50 },
        { serviceId, quantity: 1, unitPrice: 30 },
      ],
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      // servicesCost = 2*50 + 1*30 = 130
      expect(result.value.item.servicesCost).toBe(130)
      expect(result.value.services).toHaveLength(2)
      expect(quotesRepository.quoteItemServices).toHaveLength(2)
    }
  })

  it('should apply PERCENT discount on item', async () => {
    const cuttingGas = makeCuttingGas({ pricePerHour: 0 })
    await cuttingGasRepository.create(cuttingGas)

    const quote = makeQuote()
    await quotesRepository.create(quote)

    const result = await sut.execute({
      quoteId: quote.id.toString(),
      itemKind: 'SHEET',
      materialName: 'Aço',
      thickness: 3,
      baseMaterialPrice: 200,
      isFullMaterial: true,
      cuttingGasId: cuttingGas.id.toString(),
      cuttingTimeMinutes: 0,
      discountType: 'PERCENT',
      discountValue: 10,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      const { item } = result.value
      // subtotal = 200, discount = 10% = 20
      expect(item.subtotalItemCost).toBe(200)
      expect(item.discountAmount).toBe(20)
      expect(item.totalItemCost).toBe(180)
    }
  })

  it('should apply AMOUNT discount on item (capped at subtotal)', async () => {
    const cuttingGas = makeCuttingGas({ pricePerHour: 0 })
    await cuttingGasRepository.create(cuttingGas)

    const quote = makeQuote()
    await quotesRepository.create(quote)

    const result = await sut.execute({
      quoteId: quote.id.toString(),
      itemKind: 'SHEET',
      materialName: 'Aço',
      thickness: 3,
      baseMaterialPrice: 100,
      isFullMaterial: true,
      cuttingGasId: cuttingGas.id.toString(),
      cuttingTimeMinutes: 0,
      discountType: 'AMOUNT',
      discountValue: 9999,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      const { item } = result.value
      // discount capped at subtotal
      expect(item.discountAmount).toBe(100)
      expect(item.totalItemCost).toBe(0)
    }
  })

  it('should increment partNumber for each new item', async () => {
    const cuttingGas = makeCuttingGas({ pricePerHour: 0 })
    await cuttingGasRepository.create(cuttingGas)

    const quote = makeQuote()
    await quotesRepository.create(quote)

    const base = {
      quoteId: quote.id.toString(),
      itemKind: 'SHEET' as const,
      materialName: 'Aço',
      thickness: 3,
      baseMaterialPrice: 0,
      cuttingGasId: cuttingGas.id.toString(),
      cuttingTimeMinutes: 0,
    }

    await sut.execute(base)
    const result = await sut.execute(base)

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.item.partNumber).toBe(2)
    }
  })

  it('should update quote totals after adding item', async () => {
    const cuttingGas = makeCuttingGas({ pricePerHour: 60 })
    await cuttingGasRepository.create(cuttingGas)

    const quote = makeQuote()
    await quotesRepository.create(quote)

    await sut.execute({
      quoteId: quote.id.toString(),
      itemKind: 'SHEET',
      materialName: 'Aço',
      thickness: 3,
      baseMaterialPrice: 200,
      isFullMaterial: true,
      cuttingGasId: cuttingGas.id.toString(),
      cuttingTimeMinutes: 30,
    })

    const saved = quotesRepository.items[0]
    // materialCost=200, cuttingCost=30, no header discount
    expect(saved.subtotalQuote).toBe(230)
    expect(saved.totalQuote).toBe(230)
  })

  it('should not be able to add item to a non-existing quote', async () => {
    const cuttingGas = makeCuttingGas()
    await cuttingGasRepository.create(cuttingGas)

    const result = await sut.execute({
      quoteId: 'non-existing-quote',
      itemKind: 'SHEET',
      materialName: 'Aço',
      thickness: 3,
      baseMaterialPrice: 100,
      cuttingGasId: cuttingGas.id.toString(),
      cuttingTimeMinutes: 0,
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to add item with a non-existing cutting gas', async () => {
    const quote = makeQuote()
    await quotesRepository.create(quote)

    const result = await sut.execute({
      quoteId: quote.id.toString(),
      itemKind: 'SHEET',
      materialName: 'Aço',
      thickness: 3,
      baseMaterialPrice: 100,
      cuttingGasId: 'non-existing-gas',
      cuttingTimeMinutes: 0,
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})

describe('Add Quote Item – Nest/Sheet Fields', () => {
  beforeEach(() => {
    quotesRepository = new InMemoryQuotesRepository()
    cuttingGasRepository = new InMemoryCuttingGasRepository()
    calculateTotals = new CalculateQuoteTotalsUseCase(quotesRepository)
    sut = new AddQuoteItemUseCase(quotesRepository, cuttingGasRepository, calculateTotals)
  })

  it('should compute 9.35 sheet units for 10 sheets where the last is 700×1000 inside a 2000×1000 sheet', async () => {
    const cuttingGas = makeCuttingGas({ pricePerHour: 0 })
    await cuttingGasRepository.create(cuttingGas)

    const quote = makeQuote()
    await quotesRepository.create(quote)

    const result = await sut.execute({
      quoteId: quote.id.toString(),
      itemKind: 'SHEET',
      materialName: 'Aço',
      thickness: 3,
      sheetWidth: 2000,
      sheetHeight: 1000,
      baseMaterialPrice: 100,
      isFullMaterial: false,
      sheetCount: 10,
      hasPartialLastSheet: true,
      chargeFullLastSheet: false,
      partialSheetWidth: 700,
      partialSheetHeight: 1000,
      cuttingGasId: cuttingGas.id.toString(),
      cuttingTimeMinutes: 0,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      const { item } = result.value
      // partialUsage = (700*1000) / (2000*1000) = 0.35
      // computedSheetUnits = 9 + 0.35 = 9.35
      expect(item.computedSheetUnits).toBeCloseTo(9.35, 5)
      expect(item.materialCost).toBeCloseTo(935, 5) // 100 * 9.35
    }
  })

  it('should return 10 sheet units when chargeFullLastSheet=true (10 sheets, last partial)', async () => {
    const cuttingGas = makeCuttingGas({ pricePerHour: 0 })
    await cuttingGasRepository.create(cuttingGas)

    const quote = makeQuote()
    await quotesRepository.create(quote)

    const result = await sut.execute({
      quoteId: quote.id.toString(),
      itemKind: 'SHEET',
      materialName: 'Alumínio',
      thickness: 2,
      sheetWidth: 2000,
      sheetHeight: 1000,
      baseMaterialPrice: 200,
      isFullMaterial: false,
      sheetCount: 10,
      hasPartialLastSheet: true,
      chargeFullLastSheet: true,
      cuttingGasId: cuttingGas.id.toString(),
      cuttingTimeMinutes: 0,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      const { item } = result.value
      expect(item.computedSheetUnits).toBe(10)
      expect(item.materialCost).toBe(2000) // 200 * 10
    }
  })

  it('should set materialCharged=0 when isMaterialProvidedByClient=true', async () => {
    const cuttingGas = makeCuttingGas({ pricePerHour: 60 })
    await cuttingGasRepository.create(cuttingGas)

    const quote = makeQuote()
    await quotesRepository.create(quote)

    const result = await sut.execute({
      quoteId: quote.id.toString(),
      itemKind: 'SHEET',
      materialName: 'Inox',
      thickness: 3,
      baseMaterialPrice: 500,
      isFullMaterial: true,
      isMaterialProvidedByClient: true,
      cuttingGasId: cuttingGas.id.toString(),
      cuttingTimeMinutes: 60, // cuttingCost = 60
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      const { item } = result.value
      // materialCost (reference) = 500
      expect(item.materialCost).toBe(500)
      // materialCharged = 0 (provided by client)
      expect(item.materialCharged).toBe(0)
      // subtotal excludes material cost
      expect(item.subtotalItemCost).toBe(60)
      expect(item.totalItemCost).toBe(60)
    }
  })

  it('should exclude materialCharged from quote totalMaterial when material is provided by client', async () => {
    const cuttingGas = makeCuttingGas({ pricePerHour: 0 })
    await cuttingGasRepository.create(cuttingGas)

    const quote = makeQuote()
    await quotesRepository.create(quote)

    await sut.execute({
      quoteId: quote.id.toString(),
      itemKind: 'SHEET',
      materialName: 'Inox',
      thickness: 3,
      baseMaterialPrice: 1000,
      isFullMaterial: true,
      isMaterialProvidedByClient: true,
      cuttingGasId: cuttingGas.id.toString(),
      cuttingTimeMinutes: 0,
    })

    const savedQuote = quotesRepository.items[0]
    // totalMaterial uses materialCharged = 0
    expect(savedQuote.totalMaterial).toBe(0)
    expect(savedQuote.totalQuote).toBe(0)
  })

  it('should include materialCost in totalMaterial when material is NOT provided by client', async () => {
    const cuttingGas = makeCuttingGas({ pricePerHour: 0 })
    await cuttingGasRepository.create(cuttingGas)

    const quote = makeQuote()
    await quotesRepository.create(quote)

    await sut.execute({
      quoteId: quote.id.toString(),
      itemKind: 'SHEET',
      materialName: 'Aço',
      thickness: 3,
      baseMaterialPrice: 300,
      sheetCount: 2,
      isFullMaterial: false,
      isMaterialProvidedByClient: false,
      cuttingGasId: cuttingGas.id.toString(),
      cuttingTimeMinutes: 0,
    })

    const savedQuote = quotesRepository.items[0]
    // computedSheetUnits = 2, materialCost = 600, materialCharged = 600
    expect(savedQuote.totalMaterial).toBe(600)
  })
})

describe('Add Quote Item – SIMPLE_CUT mode (SHEET)', () => {
  beforeEach(() => {
    quotesRepository = new InMemoryQuotesRepository()
    cuttingGasRepository = new InMemoryCuttingGasRepository()
    calculateTotals = new CalculateQuoteTotalsUseCase(quotesRepository)
    sut = new AddQuoteItemUseCase(quotesRepository, cuttingGasRepository, calculateTotals)
  })

  it('should compute computedSheetUnits = cutArea/sheetArea for SIMPLE_CUT', async () => {
    const cuttingGas = makeCuttingGas({ pricePerHour: 0 })
    await cuttingGasRepository.create(cuttingGas)
    const quote = makeQuote()
    await quotesRepository.create(quote)

    const result = await sut.execute({
      quoteId: quote.id.toString(),
      itemKind: 'SHEET',
      materialName: 'Aço',
      thickness: 3,
      sheetWidth: 2000,
      sheetHeight: 1000,
      baseMaterialPrice: 1000,
      isFullMaterial: false,
      materialCalcMode: 'SIMPLE_CUT',
      cutWidth: 400,
      cutHeight: 600,
      cuttingGasId: cuttingGas.id.toString(),
      cuttingTimeMinutes: 0,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      const { item } = result.value
      // computedSheetUnits = (400*600) / (2000*1000) = 240000/2000000 = 0.12
      expect(item.computedSheetUnits).toBeCloseTo(0.12, 5)
      expect(item.materialCost).toBeCloseTo(120, 5) // 1000 * 0.12
    }
  })

  it('should fallback to 1 unit when cutWidth/cutHeight are missing in SIMPLE_CUT', async () => {
    const cuttingGas = makeCuttingGas({ pricePerHour: 0 })
    await cuttingGasRepository.create(cuttingGas)
    const quote = makeQuote()
    await quotesRepository.create(quote)

    const result = await sut.execute({
      quoteId: quote.id.toString(),
      itemKind: 'SHEET',
      materialName: 'Aço',
      thickness: 3,
      sheetWidth: 2000,
      sheetHeight: 1000,
      baseMaterialPrice: 500,
      isFullMaterial: false,
      materialCalcMode: 'SIMPLE_CUT',
      cuttingGasId: cuttingGas.id.toString(),
      cuttingTimeMinutes: 0,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.item.computedSheetUnits).toBe(1)
      expect(result.value.item.materialCost).toBe(500)
    }
  })

  it('should cap computedSheetUnits at 1 even if cut area exceeds sheet area', async () => {
    const cuttingGas = makeCuttingGas({ pricePerHour: 0 })
    await cuttingGasRepository.create(cuttingGas)
    const quote = makeQuote()
    await quotesRepository.create(quote)

    const result = await sut.execute({
      quoteId: quote.id.toString(),
      itemKind: 'SHEET',
      materialName: 'Aço',
      thickness: 3,
      sheetWidth: 500,
      sheetHeight: 500,
      baseMaterialPrice: 200,
      isFullMaterial: false,
      materialCalcMode: 'SIMPLE_CUT',
      cutWidth: 1000,
      cutHeight: 1000,
      cuttingGasId: cuttingGas.id.toString(),
      cuttingTimeMinutes: 0,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.item.computedSheetUnits).toBe(1)
    }
  })
})

describe('Add Quote Item – PROFILE items', () => {
  beforeEach(() => {
    quotesRepository = new InMemoryQuotesRepository()
    cuttingGasRepository = new InMemoryCuttingGasRepository()
    calculateTotals = new CalculateQuoteTotalsUseCase(quotesRepository)
    sut = new AddQuoteItemUseCase(quotesRepository, cuttingGasRepository, calculateTotals)
  })

  it('should compute computedProfileBarUnits with NEST_UNITS + partial last bar', async () => {
    const cuttingGas = makeCuttingGas({ pricePerHour: 0 })
    await cuttingGasRepository.create(cuttingGas)
    const quote = makeQuote()
    await quotesRepository.create(quote)

    const result = await sut.execute({
      quoteId: quote.id.toString(),
      itemKind: 'PROFILE',
      materialName: 'Perfil U',
      thickness: 3,
      profileLength: 3000,
      baseMaterialPrice: 100,
      isFullMaterial: false,
      materialCalcMode: 'NEST_UNITS',
      profileBarCount: 5,
      hasPartialLastProfileBar: true,
      partialProfileLength: 600,
      chargeFullLastProfileBar: false,
      cuttingGasId: cuttingGas.id.toString(),
      cuttingTimeMinutes: 0,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      const { item } = result.value
      // partialUsage = 600/3000 = 0.2
      // computedProfileBarUnits = 4 + 0.2 = 4.2
      expect(item.computedProfileBarUnits).toBeCloseTo(4.2, 5)
      expect(item.materialCost).toBeCloseTo(420, 5) // 100 * 4.2
    }
  })

  it('should return profileBarCount full bars when chargeFullLastProfileBar=true', async () => {
    const cuttingGas = makeCuttingGas({ pricePerHour: 0 })
    await cuttingGasRepository.create(cuttingGas)
    const quote = makeQuote()
    await quotesRepository.create(quote)

    const result = await sut.execute({
      quoteId: quote.id.toString(),
      itemKind: 'PROFILE',
      materialName: 'Tubo',
      thickness: 2,
      profileLength: 6000,
      baseMaterialPrice: 50,
      isFullMaterial: false,
      materialCalcMode: 'NEST_UNITS',
      profileBarCount: 3,
      hasPartialLastProfileBar: true,
      chargeFullLastProfileBar: true,
      cuttingGasId: cuttingGas.id.toString(),
      cuttingTimeMinutes: 0,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      const { item } = result.value
      expect(item.computedProfileBarUnits).toBe(3)
      expect(item.materialCost).toBe(150) // 50 * 3
    }
  })

  it('should compute computedProfileBarUnits = cutLength/profileLength for SIMPLE_CUT', async () => {
    const cuttingGas = makeCuttingGas({ pricePerHour: 0 })
    await cuttingGasRepository.create(cuttingGas)
    const quote = makeQuote()
    await quotesRepository.create(quote)

    const result = await sut.execute({
      quoteId: quote.id.toString(),
      itemKind: 'PROFILE',
      materialName: 'Barra chata',
      thickness: 5,
      profileLength: 3000,
      baseMaterialPrice: 80,
      isFullMaterial: false,
      materialCalcMode: 'SIMPLE_CUT',
      cutLength: 750,
      cuttingGasId: cuttingGas.id.toString(),
      cuttingTimeMinutes: 0,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      const { item } = result.value
      // computedProfileBarUnits = 750/3000 = 0.25
      expect(item.computedProfileBarUnits).toBeCloseTo(0.25, 5)
      expect(item.materialCost).toBeCloseTo(20, 5) // 80 * 0.25
    }
  })

  it('should cap computedProfileBarUnits at 1 for SIMPLE_CUT when cutLength > profileLength', async () => {
    const cuttingGas = makeCuttingGas({ pricePerHour: 0 })
    await cuttingGasRepository.create(cuttingGas)
    const quote = makeQuote()
    await quotesRepository.create(quote)

    const result = await sut.execute({
      quoteId: quote.id.toString(),
      itemKind: 'PROFILE',
      materialName: 'Tubo redondo',
      thickness: 3,
      profileLength: 1000,
      baseMaterialPrice: 100,
      isFullMaterial: false,
      materialCalcMode: 'SIMPLE_CUT',
      cutLength: 5000,
      cuttingGasId: cuttingGas.id.toString(),
      cuttingTimeMinutes: 0,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.item.computedProfileBarUnits).toBe(1)
    }
  })

  it('should store scrapNotes on the item without affecting calculation', async () => {
    const cuttingGas = makeCuttingGas({ pricePerHour: 0 })
    await cuttingGasRepository.create(cuttingGas)
    const quote = makeQuote()
    await quotesRepository.create(quote)

    const result = await sut.execute({
      quoteId: quote.id.toString(),
      itemKind: 'PROFILE',
      materialName: 'Cantoneira',
      thickness: 3,
      profileLength: 6000,
      baseMaterialPrice: 50,
      isFullMaterial: false,
      materialCalcMode: 'NEST_UNITS',
      profileBarCount: 2,
      scrapNotes: 'Sobra vai para estoque B',
      cuttingGasId: cuttingGas.id.toString(),
      cuttingTimeMinutes: 0,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      const { item } = result.value
      expect(item.scrapNotes).toBe('Sobra vai para estoque B')
      expect(item.computedProfileBarUnits).toBe(2)
    }
  })

  it('should set materialCharged=0 for PROFILE when isMaterialProvidedByClient=true', async () => {
    const cuttingGas = makeCuttingGas({ pricePerHour: 0 })
    await cuttingGasRepository.create(cuttingGas)
    const quote = makeQuote()
    await quotesRepository.create(quote)

    const result = await sut.execute({
      quoteId: quote.id.toString(),
      itemKind: 'PROFILE',
      materialName: 'Tubo quadrado',
      thickness: 3,
      profileLength: 6000,
      baseMaterialPrice: 200,
      isFullMaterial: false,
      materialCalcMode: 'NEST_UNITS',
      profileBarCount: 3,
      isMaterialProvidedByClient: true,
      cuttingGasId: cuttingGas.id.toString(),
      cuttingTimeMinutes: 0,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      const { item } = result.value
      // materialCost (reference) = 200 * 3 = 600
      expect(item.materialCost).toBe(600)
      // materialCharged = 0 (provided by client)
      expect(item.materialCharged).toBe(0)
      // subtotal excludes material
      expect(item.subtotalItemCost).toBe(0)
    }
  })
})
