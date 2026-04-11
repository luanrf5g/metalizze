import { InMemoryQuotesRepository } from 'test/repositories/in-memory-quotes-repository'
import { TransitionQuoteStatusUseCase } from './transition-quote-status'
import { makeQuote } from 'test/factories/make-quote'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { InvalidQuoteStatusTransitionError } from './errors/invalid-quote-status-transition-error'

let quotesRepository: InMemoryQuotesRepository
let sut: TransitionQuoteStatusUseCase

describe('Transition Quote Status Use Case', () => {
  beforeEach(() => {
    quotesRepository = new InMemoryQuotesRepository()
    sut = new TransitionQuoteStatusUseCase(quotesRepository)
  })

  it('should transition from DRAFT to SENT and set sentAt', async () => {
    const quote = makeQuote({ status: 'DRAFT' })
    await quotesRepository.create(quote)

    const before = new Date()
    const result = await sut.execute({
      quoteId: quote.id.toString(),
      toStatus: 'SENT',
    })
    const after = new Date()

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.quote.status).toBe('SENT')
      expect(result.value.quote.sentAt).toBeDefined()
      expect(result.value.quote.sentAt!.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(result.value.quote.sentAt!.getTime()).toBeLessThanOrEqual(after.getTime())
    }
  })

  it('should transition from DRAFT to APPROVED and set approvedAt', async () => {
    const quote = makeQuote({ status: 'DRAFT' })
    await quotesRepository.create(quote)

    const result = await sut.execute({
      quoteId: quote.id.toString(),
      toStatus: 'APPROVED',
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.quote.status).toBe('APPROVED')
      expect(result.value.quote.approvedAt).toBeDefined()
    }
  })

  it('should transition from DRAFT to REJECTED and set rejectedAt', async () => {
    const quote = makeQuote({ status: 'DRAFT' })
    await quotesRepository.create(quote)

    const result = await sut.execute({
      quoteId: quote.id.toString(),
      toStatus: 'REJECTED',
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.quote.status).toBe('REJECTED')
      expect(result.value.quote.rejectedAt).toBeDefined()
    }
  })

  it('should transition from SENT to APPROVED', async () => {
    const quote = makeQuote({ status: 'SENT' })
    await quotesRepository.create(quote)

    const result = await sut.execute({
      quoteId: quote.id.toString(),
      toStatus: 'APPROVED',
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.quote.status).toBe('APPROVED')
    }
  })

  it('should transition from SENT back to DRAFT and increment revision', async () => {
    const existingSentAt = new Date('2026-01-01T12:00:00Z')
    const quote = makeQuote({ status: 'SENT', revision: 1, sentAt: existingSentAt })
    await quotesRepository.create(quote)

    const result = await sut.execute({
      quoteId: quote.id.toString(),
      toStatus: 'DRAFT',
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.quote.status).toBe('DRAFT')
      expect(result.value.quote.revision).toBe(2)
      // sentAt should be preserved (not cleared)
      expect(result.value.quote.sentAt).toEqual(existingSentAt)
    }
  })

  it('should return InvalidQuoteStatusTransitionError for APPROVED -> DRAFT', async () => {
    const quote = makeQuote({ status: 'APPROVED' })
    await quotesRepository.create(quote)

    const result = await sut.execute({
      quoteId: quote.id.toString(),
      toStatus: 'DRAFT',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidQuoteStatusTransitionError)
  })

  it('should return InvalidQuoteStatusTransitionError for REJECTED -> any', async () => {
    const quote = makeQuote({ status: 'REJECTED' })
    await quotesRepository.create(quote)

    for (const toStatus of ['DRAFT', 'SENT', 'APPROVED', 'EXPIRED'] as const) {
      const result = await sut.execute({
        quoteId: quote.id.toString(),
        toStatus,
      })
      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(InvalidQuoteStatusTransitionError)
    }
  })

  it('should return InvalidQuoteStatusTransitionError for EXPIRED -> any', async () => {
    const quote = makeQuote({ status: 'EXPIRED' })
    await quotesRepository.create(quote)

    for (const toStatus of ['DRAFT', 'SENT', 'APPROVED', 'REJECTED'] as const) {
      const result = await sut.execute({
        quoteId: quote.id.toString(),
        toStatus,
      })
      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(InvalidQuoteStatusTransitionError)
    }
  })

  it('should return ResourceNotFoundError when quote does not exist', async () => {
    const result = await sut.execute({
      quoteId: 'non-existent',
      toStatus: 'SENT',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not modify the quote on an invalid transition', async () => {
    const quote = makeQuote({ status: 'APPROVED' })
    await quotesRepository.create(quote)

    await sut.execute({
      quoteId: quote.id.toString(),
      toStatus: 'DRAFT',
    })

    // Status should remain APPROVED
    const unchanged = await quotesRepository.findById(quote.id.toString())
    expect(unchanged?.status).toBe('APPROVED')
  })
})
