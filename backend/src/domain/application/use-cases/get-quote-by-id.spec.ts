import { InMemoryQuotesRepository } from 'test/repositories/in-memory-quotes-repository'
import { GetQuoteByIdUseCase } from './get-quote-by-id'
import { makeQuote, makeQuoteItem, makeQuoteItemService } from 'test/factories/make-quote'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

let quotesRepository: InMemoryQuotesRepository
let sut: GetQuoteByIdUseCase

describe('Get Quote By Id Use Case', () => {
  beforeEach(() => {
    quotesRepository = new InMemoryQuotesRepository()
    sut = new GetQuoteByIdUseCase(quotesRepository)
  })

  it('should be able to get a quote with its items', async () => {
    const quote = makeQuote()
    await quotesRepository.create(quote)

    const item = makeQuoteItem({ quoteId: quote.id, partNumber: 1 })
    await quotesRepository.addItem(item, [])

    const result = await sut.execute({ quoteId: quote.id.toString() })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      const { quoteWithItems } = result.value
      expect(quoteWithItems.quote.id.equals(quote.id)).toBe(true)
      expect(quoteWithItems.items).toHaveLength(1)
      expect(quoteWithItems.items[0].item.id.equals(item.id)).toBe(true)
    }
  })

  it('should return items with their services', async () => {
    const quote = makeQuote()
    await quotesRepository.create(quote)

    const item = makeQuoteItem({ quoteId: quote.id })
    const service1 = makeQuoteItemService({ quoteItemId: item.id, quantity: 2, unitPrice: 50, totalPrice: 100 })
    const service2 = makeQuoteItemService({ quoteItemId: item.id, quantity: 1, unitPrice: 30, totalPrice: 30 })
    await quotesRepository.addItem(item, [service1, service2])

    const result = await sut.execute({ quoteId: quote.id.toString() })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      const entry = result.value.quoteWithItems.items[0]
      expect(entry.services).toHaveLength(2)
      expect(entry.services[0].totalPrice).toBe(100)
      expect(entry.services[1].totalPrice).toBe(30)
    }
  })

  it('should return items ordered by partNumber', async () => {
    const quote = makeQuote()
    await quotesRepository.create(quote)

    const item3 = makeQuoteItem({ quoteId: quote.id, partNumber: 3 })
    const item1 = makeQuoteItem({ quoteId: quote.id, partNumber: 1 })
    const item2 = makeQuoteItem({ quoteId: quote.id, partNumber: 2 })
    await quotesRepository.addItem(item3, [])
    await quotesRepository.addItem(item1, [])
    await quotesRepository.addItem(item2, [])

    const result = await sut.execute({ quoteId: quote.id.toString() })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      const numbers = result.value.quoteWithItems.items.map((e) => e.item.partNumber)
      expect(numbers).toEqual([1, 2, 3])
    }
  })

  it('should return a quote with no items when none were added', async () => {
    const quote = makeQuote()
    await quotesRepository.create(quote)

    const result = await sut.execute({ quoteId: quote.id.toString() })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.quoteWithItems.items).toHaveLength(0)
    }
  })

  it('should not be able to get a non-existing quote', async () => {
    const result = await sut.execute({ quoteId: 'non-existing-id' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
