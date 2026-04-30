import { InMemoryQuotesRepository } from 'test/repositories/in-memory-quotes-repository'
import { InMemoryCuttingGasRepository } from 'test/repositories/in-memory-cutting-gas-repository'
import { CalculateQuoteTotalsUseCase } from './calculate-quote-totals'
import { UpdateQuoteItemUseCase } from './update-quote-item'
import { makeQuote, makeQuoteItem } from 'test/factories/make-quote'
import { makeCuttingGas } from 'test/factories/make-cutting-gas'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { QuoteNotEditableError } from './errors/quote-not-editable-error'

let quotesRepository: InMemoryQuotesRepository
let cuttingGasRepository: InMemoryCuttingGasRepository
let calculateTotals: CalculateQuoteTotalsUseCase
let sut: UpdateQuoteItemUseCase

describe('Update Quote Item Use Case', () => {
  beforeEach(() => {
    quotesRepository = new InMemoryQuotesRepository()
    cuttingGasRepository = new InMemoryCuttingGasRepository()
    calculateTotals = new CalculateQuoteTotalsUseCase(quotesRepository)
    sut = new UpdateQuoteItemUseCase(quotesRepository, cuttingGasRepository, calculateTotals)
  })

  it('should be able to update fields and recalculate costs', async () => {
    const cuttingGas = makeCuttingGas({ pricePerHour: 60 })
    await cuttingGasRepository.create(cuttingGas)

    const quote = makeQuote({ status: 'DRAFT' })
    await quotesRepository.create(quote)

    const item = makeQuoteItem({
      quoteId: quote.id,
      cuttingGasId: cuttingGas.id,
      baseMaterialPrice: 100,
      isFullMaterial: true,
      cuttingTimeMinutes: 30,
      setupTimeMinutes: 0,
      setupPricePerHour: 0,
      finishingPrice: 0,
      materialCost: 100,
      cuttingCost: 30,
      setupCost: 0,
      servicesCost: 0,
      subtotalItemCost: 130,
      discountAmount: 0,
      totalItemCost: 130,
    })
    quotesRepository.quoteItems.push(item)

    const result = await sut.execute({
      quoteId: quote.id.toString(),
      itemId: item.id.toString(),
      baseMaterialPrice: 200,
      isFullMaterial: true,
      cuttingTimeMinutes: 60,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      // materialCost = 200 (full)
      // cuttingCost = (60/60) * 60 = 60
      expect(result.value.item.materialCost).toBe(200)
      expect(result.value.item.cuttingCost).toBe(60)
      expect(result.value.item.subtotalItemCost).toBe(260)
      expect(result.value.item.totalItemCost).toBe(260)
    }
  })

  it('should recalculate material cost using usagePercentage when not full material', async () => {
    const cuttingGas = makeCuttingGas({ pricePerHour: 60 })
    await cuttingGasRepository.create(cuttingGas)

    const quote = makeQuote({ status: 'DRAFT' })
    await quotesRepository.create(quote)

    const item = makeQuoteItem({
      quoteId: quote.id,
      cuttingGasId: cuttingGas.id,
      baseMaterialPrice: 100,
      isFullMaterial: false,
      usagePercentage: 50,
      cuttingTimeMinutes: 30,
      setupTimeMinutes: 0,
      setupPricePerHour: 0,
      finishingPrice: 0,
      materialCost: 50,
      cuttingCost: 30,
      setupCost: 0,
      servicesCost: 0,
      subtotalItemCost: 80,
      discountAmount: 0,
      totalItemCost: 80,
    })
    quotesRepository.quoteItems.push(item)

    const result = await sut.execute({
      quoteId: quote.id.toString(),
      itemId: item.id.toString(),
      usagePercentage: 75,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      // materialCost = 100 * 0.75 = 75
      expect(result.value.item.materialCost).toBe(75)
    }
  })

  it('should apply PERCENT discount after recalculation', async () => {
    const cuttingGas = makeCuttingGas({ pricePerHour: 60 })
    await cuttingGasRepository.create(cuttingGas)

    const quote = makeQuote({ status: 'DRAFT' })
    await quotesRepository.create(quote)

    const item = makeQuoteItem({
      quoteId: quote.id,
      cuttingGasId: cuttingGas.id,
      baseMaterialPrice: 100,
      isFullMaterial: true,
      cuttingTimeMinutes: 0,
      setupTimeMinutes: 0,
      setupPricePerHour: 0,
      finishingPrice: 0,
      materialCost: 100,
      cuttingCost: 0,
      setupCost: 0,
      servicesCost: 0,
      subtotalItemCost: 100,
      discountAmount: 0,
      totalItemCost: 100,
    })
    quotesRepository.quoteItems.push(item)

    const result = await sut.execute({
      quoteId: quote.id.toString(),
      itemId: item.id.toString(),
      discountType: 'PERCENT',
      discountValue: 10,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.item.discountAmount).toBe(10)
      expect(result.value.item.totalItemCost).toBe(90)
    }
  })

  it('should return QuoteNotEditableError when quote is not DRAFT', async () => {
    const cuttingGas = makeCuttingGas({ pricePerHour: 60 })
    await cuttingGasRepository.create(cuttingGas)

    const quote = makeQuote({ status: 'SENT' })
    await quotesRepository.create(quote)

    const item = makeQuoteItem({ quoteId: quote.id, cuttingGasId: cuttingGas.id })
    quotesRepository.quoteItems.push(item)

    const result = await sut.execute({
      quoteId: quote.id.toString(),
      itemId: item.id.toString(),
      materialName: 'Novo Material',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(QuoteNotEditableError)
  })

  it('should return ResourceNotFoundError when quote does not exist', async () => {
    const result = await sut.execute({
      quoteId: 'non-existent',
      itemId: 'non-existent',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return ResourceNotFoundError when item does not exist', async () => {
    const quote = makeQuote({ status: 'DRAFT' })
    await quotesRepository.create(quote)

    const result = await sut.execute({
      quoteId: quote.id.toString(),
      itemId: 'non-existent-item',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return ResourceNotFoundError when item belongs to a different quote', async () => {
    const cuttingGas = makeCuttingGas({ pricePerHour: 60 })
    await cuttingGasRepository.create(cuttingGas)

    const quote = makeQuote({ status: 'DRAFT' })
    await quotesRepository.create(quote)

    const otherQuoteId = new UniqueEntityId()
    const item = makeQuoteItem({ quoteId: otherQuoteId, cuttingGasId: cuttingGas.id })
    quotesRepository.quoteItems.push(item)

    const result = await sut.execute({
      quoteId: quote.id.toString(),
      itemId: item.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return ResourceNotFoundError when cuttingGas does not exist', async () => {
    const quote = makeQuote({ status: 'DRAFT' })
    await quotesRepository.create(quote)

    const item = makeQuoteItem({ quoteId: quote.id, cuttingGasId: new UniqueEntityId('existing-gas') })
    quotesRepository.quoteItems.push(item)

    const result = await sut.execute({
      quoteId: quote.id.toString(),
      itemId: item.id.toString(),
      cuttingGasId: 'non-existent-gas',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should apply minimum cutting cost (15 min) when chargeMinimumCutting=true', async () => {
    const cuttingGas = makeCuttingGas({ pricePerHour: 120 })
    await cuttingGasRepository.create(cuttingGas)

    const quote = makeQuote({ status: 'DRAFT' })
    await quotesRepository.create(quote)

    const item = makeQuoteItem({
      quoteId: quote.id,
      cuttingGasId: cuttingGas.id,
      baseMaterialPrice: 0,
      isFullMaterial: true,
      cuttingTimeMinutes: 30,
      chargeMinimumCutting: false,
      cuttingCost: 60,
      materialCost: 0,
      setupCost: 0,
      servicesCost: 0,
      subtotalItemCost: 60,
      discountAmount: 0,
      totalItemCost: 60,
    })
    quotesRepository.quoteItems.push(item)

    const result = await sut.execute({
      quoteId: quote.id.toString(),
      itemId: item.id.toString(),
      cuttingTimeMinutes: 5,
      chargeMinimumCutting: true,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      const { item: updatedItem } = result.value
      // real time is preserved
      expect(updatedItem.cuttingTimeMinutes).toBe(5)
      // effective time is 15 (minimum)
      expect(updatedItem.effectiveCuttingTimeMinutes).toBe(15)
      // cuttingCost = 120 * (15/60) = 30
      expect(updatedItem.cuttingCost).toBe(30)
    }
  })
})
