import { InMemoryQuotesRepository } from 'test/repositories/in-memory-quotes-repository'
import { CalculateQuoteTotalsUseCase } from './calculate-quote-totals'
import { ReplaceQuoteItemServicesUseCase } from './replace-quote-item-services'
import { makeQuote, makeQuoteItem, makeQuoteItemService } from 'test/factories/make-quote'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { QuoteNotEditableError } from './errors/quote-not-editable-error'

let quotesRepository: InMemoryQuotesRepository
let calculateTotals: CalculateQuoteTotalsUseCase
let sut: ReplaceQuoteItemServicesUseCase

describe('Replace Quote Item Services Use Case', () => {
  beforeEach(() => {
    quotesRepository = new InMemoryQuotesRepository()
    calculateTotals = new CalculateQuoteTotalsUseCase(quotesRepository)
    sut = new ReplaceQuoteItemServicesUseCase(quotesRepository, calculateTotals)
  })

  it('should be able to replace services and update servicesCost on the item', async () => {
    const quote = makeQuote({ status: 'DRAFT' })
    await quotesRepository.create(quote)

    const item = makeQuoteItem({
      quoteId: quote.id,
      materialCost: 100,
      cuttingCost: 30,
      setupCost: 0,
      finishingPrice: 0,
      servicesCost: 0,
      subtotalItemCost: 130,
      discountAmount: 0,
      totalItemCost: 130,
    })
    quotesRepository.quoteItems.push(item)

    // Add old services that should be replaced
    const oldService = makeQuoteItemService({ quoteItemId: item.id, totalPrice: 20 })
    quotesRepository.quoteItemServices.push(oldService)

    const serviceId = new UniqueEntityId()
    const result = await sut.execute({
      quoteId: quote.id.toString(),
      itemId: item.id.toString(),
      services: [
        { serviceId: serviceId.toString(), quantity: 2, unitPrice: 50 },
      ],
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      // newServicesCost = 2 * 50 = 100
      // subtotal = 100 + 30 + 0 + 100 + 0 = 230
      expect(result.value.item.servicesCost).toBe(100)
      expect(result.value.item.subtotalItemCost).toBe(230)
      expect(result.value.item.totalItemCost).toBe(230)
      expect(result.value.services).toHaveLength(1)
    }

    // Old service replaced, new one present
    expect(quotesRepository.quoteItemServices).toHaveLength(1)
    expect(quotesRepository.quoteItemServices[0].totalPrice).toBe(100)
  })

  it('should be able to clear all services by passing empty array', async () => {
    const quote = makeQuote({ status: 'DRAFT' })
    await quotesRepository.create(quote)

    const item = makeQuoteItem({
      quoteId: quote.id,
      materialCost: 100,
      cuttingCost: 0,
      setupCost: 0,
      finishingPrice: 0,
      servicesCost: 50,
      subtotalItemCost: 150,
      discountAmount: 0,
      totalItemCost: 150,
    })
    quotesRepository.quoteItems.push(item)

    const existingService = makeQuoteItemService({ quoteItemId: item.id, totalPrice: 50 })
    quotesRepository.quoteItemServices.push(existingService)

    const result = await sut.execute({
      quoteId: quote.id.toString(),
      itemId: item.id.toString(),
      services: [],
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.item.servicesCost).toBe(0)
      expect(result.value.item.subtotalItemCost).toBe(100)
      expect(result.value.services).toHaveLength(0)
    }
    expect(quotesRepository.quoteItemServices).toHaveLength(0)
  })

  it('should recalculate discount properly after replacing services', async () => {
    const quote = makeQuote({ status: 'DRAFT' })
    await quotesRepository.create(quote)

    const item = makeQuoteItem({
      quoteId: quote.id,
      materialCost: 100,
      cuttingCost: 0,
      setupCost: 0,
      finishingPrice: 0,
      servicesCost: 0,
      subtotalItemCost: 100,
      discountType: 'PERCENT',
      discountValue: 10,
      discountAmount: 10,
      totalItemCost: 90,
    })
    quotesRepository.quoteItems.push(item)

    const result = await sut.execute({
      quoteId: quote.id.toString(),
      itemId: item.id.toString(),
      services: [
        { serviceId: new UniqueEntityId().toString(), quantity: 1, unitPrice: 100 },
      ],
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      // subtotal = 100 + 100 = 200; 10% discount = 20; total = 180
      expect(result.value.item.subtotalItemCost).toBe(200)
      expect(result.value.item.discountAmount).toBe(20)
      expect(result.value.item.totalItemCost).toBe(180)
    }
  })

  it('should return QuoteNotEditableError when quote is not DRAFT', async () => {
    const quote = makeQuote({ status: 'SENT' })
    await quotesRepository.create(quote)

    const item = makeQuoteItem({ quoteId: quote.id })
    quotesRepository.quoteItems.push(item)

    const result = await sut.execute({
      quoteId: quote.id.toString(),
      itemId: item.id.toString(),
      services: [],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(QuoteNotEditableError)
  })

  it('should return ResourceNotFoundError when quote does not exist', async () => {
    const result = await sut.execute({
      quoteId: 'non-existent',
      itemId: 'non-existent',
      services: [],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return ResourceNotFoundError when item belongs to a different quote', async () => {
    const quote = makeQuote({ status: 'DRAFT' })
    await quotesRepository.create(quote)

    const otherQuoteId = new UniqueEntityId()
    const item = makeQuoteItem({ quoteId: otherQuoteId })
    quotesRepository.quoteItems.push(item)

    const result = await sut.execute({
      quoteId: quote.id.toString(),
      itemId: item.id.toString(),
      services: [],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
