import { InMemoryQuotesRepository } from 'test/repositories/in-memory-quotes-repository'
import { CalculateQuoteTotalsUseCase } from './calculate-quote-totals'
import { RemoveQuoteItemUseCase } from './remove-quote-item'
import { makeQuote, makeQuoteItem } from 'test/factories/make-quote'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { QuoteNotEditableError } from './errors/quote-not-editable-error'

let quotesRepository: InMemoryQuotesRepository
let calculateTotals: CalculateQuoteTotalsUseCase
let sut: RemoveQuoteItemUseCase

describe('Remove Quote Item Use Case', () => {
  beforeEach(() => {
    quotesRepository = new InMemoryQuotesRepository()
    calculateTotals = new CalculateQuoteTotalsUseCase(quotesRepository)
    sut = new RemoveQuoteItemUseCase(quotesRepository, calculateTotals)
  })

  it('should be able to remove an item from a DRAFT quote', async () => {
    const quote = makeQuote({ status: 'DRAFT' })
    await quotesRepository.create(quote)

    const item = makeQuoteItem({ quoteId: quote.id })
    quotesRepository.quoteItems.push(item)

    expect(quotesRepository.quoteItems).toHaveLength(1)

    const result = await sut.execute({
      quoteId: quote.id.toString(),
      itemId: item.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    expect(quotesRepository.quoteItems).toHaveLength(0)
  })

  it('should recalculate quote totals after removal', async () => {
    const quote = makeQuote({
      status: 'DRAFT',
      totalMaterial: 100,
      subtotalQuote: 100,
      totalQuote: 100,
    })
    await quotesRepository.create(quote)

    const item = makeQuoteItem({
      quoteId: quote.id,
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
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      // After removing the only item, all totals should be zero
      expect(result.value.quote.totalMaterial).toBe(0)
      expect(result.value.quote.totalQuote).toBe(0)
    }
  })

  it('should return QuoteNotEditableError when quote is not DRAFT', async () => {
    const quote = makeQuote({ status: 'APPROVED' })
    await quotesRepository.create(quote)

    const item = makeQuoteItem({ quoteId: quote.id })
    quotesRepository.quoteItems.push(item)

    const result = await sut.execute({
      quoteId: quote.id.toString(),
      itemId: item.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(QuoteNotEditableError)
    // item should not have been removed
    expect(quotesRepository.quoteItems).toHaveLength(1)
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
    const quote = makeQuote({ status: 'DRAFT' })
    await quotesRepository.create(quote)

    const otherQuoteId = new UniqueEntityId()
    const item = makeQuoteItem({ quoteId: otherQuoteId })
    quotesRepository.quoteItems.push(item)

    const result = await sut.execute({
      quoteId: quote.id.toString(),
      itemId: item.id.toString(),
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
    // item should still be there
    expect(quotesRepository.quoteItems).toHaveLength(1)
  })
})
