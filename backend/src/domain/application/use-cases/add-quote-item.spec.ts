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
