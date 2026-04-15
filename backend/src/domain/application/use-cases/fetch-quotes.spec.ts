import { InMemoryQuotesRepository } from 'test/repositories/in-memory-quotes-repository'
import { FetchQuotesUseCase } from './fetch-quotes'
import { makeQuote } from 'test/factories/make-quote'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'

let quotesRepository: InMemoryQuotesRepository
let sut: FetchQuotesUseCase

describe('Fetch Quotes Use Case', () => {
  beforeEach(() => {
    quotesRepository = new InMemoryQuotesRepository()
    sut = new FetchQuotesUseCase(quotesRepository)
  })

  it('should be able to fetch quotes paginated', async () => {
    for (let i = 0; i < 5; i++) {
      await quotesRepository.create(makeQuote())
    }

    const result = await sut.execute({ page: 1 })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.quotes).toHaveLength(5)
    }
  })

  it('should return at most 20 quotes per page', async () => {
    for (let i = 0; i < 25; i++) {
      await quotesRepository.create(makeQuote())
    }

    const result = await sut.execute({ page: 1 })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.quotes).toHaveLength(20)
    }
  })

  it('should return second page correctly', async () => {
    for (let i = 0; i < 25; i++) {
      await quotesRepository.create(makeQuote())
    }

    const result = await sut.execute({ page: 2 })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.quotes).toHaveLength(5)
    }
  })

  it('should filter quotes by clientId', async () => {
    const clientId = new UniqueEntityId()

    await quotesRepository.create(makeQuote({ clientId }))
    await quotesRepository.create(makeQuote({ clientId }))
    await quotesRepository.create(makeQuote()) // no client

    const result = await sut.execute({ page: 1, clientId: clientId.toString() })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.quotes).toHaveLength(2)
    }
  })

  it('should filter quotes by status', async () => {
    await quotesRepository.create(makeQuote({ status: 'DRAFT' }))
    await quotesRepository.create(makeQuote({ status: 'DRAFT' }))
    await quotesRepository.create(makeQuote({ status: 'APPROVED' }))

    const result = await sut.execute({ page: 1, status: ['DRAFT'] })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.quotes).toHaveLength(2)
      expect(result.value.quotes.every((q) => q.quote.status === 'DRAFT')).toBe(true)
    }
  })

  it('should filter quotes by multiple statuses', async () => {
    await quotesRepository.create(makeQuote({ status: 'DRAFT' }))
    await quotesRepository.create(makeQuote({ status: 'SENT' }))
    await quotesRepository.create(makeQuote({ status: 'APPROVED' }))

    const result = await sut.execute({ page: 1, status: ['DRAFT', 'SENT'] })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.quotes).toHaveLength(2)
    }
  })

  it('should return empty when no quotes match filters', async () => {
    await quotesRepository.create(makeQuote({ status: 'DRAFT' }))

    const result = await sut.execute({ page: 1, status: ['APPROVED'] })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.quotes).toHaveLength(0)
    }
  })

  it('should return empty list when there are no quotes', async () => {
    const result = await sut.execute({ page: 1 })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.quotes).toHaveLength(0)
    }
  })

  it('should return meta with correct pagination info', async () => {
    for (let i = 0; i < 5; i++) {
      await quotesRepository.create(makeQuote())
    }

    const result = await sut.execute({ page: 2, perPage: 2 })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.meta.page).toBe(2)
      expect(result.value.meta.perPage).toBe(2)
      expect(result.value.meta.total).toBe(5)
      expect(result.value.meta.totalPages).toBe(3)
      expect(result.value.quotes).toHaveLength(2)
    }
  })
})
