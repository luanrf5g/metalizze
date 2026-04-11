import { InMemoryQuotesRepository } from 'test/repositories/in-memory-quotes-repository'
import { CalculateQuoteTotalsUseCase } from './calculate-quote-totals'
import { makeQuote, makeQuoteItem } from 'test/factories/make-quote'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

let quotesRepository: InMemoryQuotesRepository
let sut: CalculateQuoteTotalsUseCase

describe('Calculate Quote Totals Use Case', () => {
  beforeEach(() => {
    quotesRepository = new InMemoryQuotesRepository()
    sut = new CalculateQuoteTotalsUseCase(quotesRepository)
  })

  it('should sum item costs into quote totals', async () => {
    const quote = makeQuote()
    await quotesRepository.create(quote)

    const item1 = makeQuoteItem({
      quoteId: quote.id,
      materialCost: 100,
      cuttingCost: 30,
      setupCost: 20,
      servicesCost: 10,
      finishingPrice: 5,
      subtotalItemCost: 165,
      discountAmount: 0,
      totalItemCost: 165,
    })
    const item2 = makeQuoteItem({
      quoteId: quote.id,
      materialCost: 200,
      cuttingCost: 60,
      setupCost: 0,
      servicesCost: 0,
      finishingPrice: 0,
      subtotalItemCost: 260,
      discountAmount: 0,
      totalItemCost: 260,
    })
    await quotesRepository.addItem(item1, [])
    await quotesRepository.addItem(item2, [])

    const result = await sut.execute({ quoteId: quote.id.toString() })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      const { quote: updated } = result.value
      expect(updated.totalMaterial).toBe(300)
      expect(updated.totalCutting).toBe(90)
      expect(updated.totalSetup).toBe(20)
      expect(updated.totalServices).toBe(10)
      expect(updated.subtotalQuote).toBe(425)
      expect(updated.discountAmount).toBe(0)
      expect(updated.totalQuote).toBe(425)
    }
  })

  it('should apply PERCENT header discount', async () => {
    const quote = makeQuote({ discountType: 'PERCENT', discountValue: 20 })
    await quotesRepository.create(quote)

    const item = makeQuoteItem({
      quoteId: quote.id,
      materialCost: 500,
      cuttingCost: 0,
      setupCost: 0,
      servicesCost: 0,
      finishingPrice: 0,
      subtotalItemCost: 500,
      discountAmount: 0,
      totalItemCost: 500,
    })
    await quotesRepository.addItem(item, [])

    const result = await sut.execute({ quoteId: quote.id.toString() })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      const { quote: updated } = result.value
      // subtotal = 500, 20% off = 100
      expect(updated.subtotalQuote).toBe(500)
      expect(updated.discountAmount).toBe(100)
      expect(updated.totalQuote).toBe(400)
    }
  })

  it('should apply AMOUNT header discount', async () => {
    const quote = makeQuote({ discountType: 'AMOUNT', discountValue: 150 })
    await quotesRepository.create(quote)

    const item = makeQuoteItem({
      quoteId: quote.id,
      materialCost: 400,
      cuttingCost: 0,
      setupCost: 0,
      servicesCost: 0,
      finishingPrice: 0,
      subtotalItemCost: 400,
      discountAmount: 0,
      totalItemCost: 400,
    })
    await quotesRepository.addItem(item, [])

    const result = await sut.execute({ quoteId: quote.id.toString() })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      const { quote: updated } = result.value
      expect(updated.discountAmount).toBe(150)
      expect(updated.totalQuote).toBe(250)
    }
  })

  it('should cap AMOUNT discount at the subtotal value', async () => {
    const quote = makeQuote({ discountType: 'AMOUNT', discountValue: 9999 })
    await quotesRepository.create(quote)

    const item = makeQuoteItem({
      quoteId: quote.id,
      materialCost: 100,
      cuttingCost: 0,
      setupCost: 0,
      servicesCost: 0,
      finishingPrice: 0,
      subtotalItemCost: 100,
      discountAmount: 0,
      totalItemCost: 100,
    })
    await quotesRepository.addItem(item, [])

    const result = await sut.execute({ quoteId: quote.id.toString() })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.quote.discountAmount).toBe(100)
      expect(result.value.quote.totalQuote).toBe(0)
    }
  })

  it('should return zero totals for a quote with no items', async () => {
    const quote = makeQuote()
    await quotesRepository.create(quote)

    const result = await sut.execute({ quoteId: quote.id.toString() })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      const { quote: updated } = result.value
      expect(updated.subtotalQuote).toBe(0)
      expect(updated.totalQuote).toBe(0)
    }
  })

  it('should not be able to calculate totals for a non-existing quote', async () => {
    const result = await sut.execute({ quoteId: 'non-existing-id' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should persist the updated totals in the repository', async () => {
    const quote = makeQuote()
    await quotesRepository.create(quote)

    const item = makeQuoteItem({
      quoteId: quote.id,
      materialCost: 300,
      cuttingCost: 0,
      setupCost: 0,
      servicesCost: 0,
      finishingPrice: 0,
      subtotalItemCost: 300,
      discountAmount: 0,
      totalItemCost: 300,
    })
    await quotesRepository.addItem(item, [])

    await sut.execute({ quoteId: quote.id.toString() })

    expect(quotesRepository.items[0].subtotalQuote).toBe(300)
    expect(quotesRepository.items[0].totalQuote).toBe(300)
  })
})
