import { InMemoryQuotesRepository } from 'test/repositories/in-memory-quotes-repository'
import { InMemoryClientsRepository } from 'test/repositories/in-memory-clients-repository'
import { CalculateQuoteTotalsUseCase } from './calculate-quote-totals'
import { UpdateQuoteUseCase } from './update-quote'
import { makeQuote } from 'test/factories/make-quote'
import { makeClient } from 'test/factories/make-client'
import { ResourceNotFoundError } from './errors/resource-not-found-error'
import { QuoteNotEditableError } from './errors/quote-not-editable-error'

let quotesRepository: InMemoryQuotesRepository
let clientsRepository: InMemoryClientsRepository
let calculateTotals: CalculateQuoteTotalsUseCase
let sut: UpdateQuoteUseCase

describe('Update Quote Use Case', () => {
  beforeEach(() => {
    quotesRepository = new InMemoryQuotesRepository()
    clientsRepository = new InMemoryClientsRepository()
    calculateTotals = new CalculateQuoteTotalsUseCase(quotesRepository)
    sut = new UpdateQuoteUseCase(quotesRepository, clientsRepository, calculateTotals)
  })

  it('should be able to update notes and validUntil on a DRAFT quote', async () => {
    const quote = makeQuote({ status: 'DRAFT' })
    await quotesRepository.create(quote)

    const validUntil = new Date('2026-12-31')

    const result = await sut.execute({
      quoteId: quote.id.toString(),
      notes: 'Novo comentário',
      validUntil,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.quote.notes).toBe('Novo comentário')
      expect(result.value.quote.validUntil).toEqual(validUntil)
    }
  })

  it('should be able to update discount fields', async () => {
    const quote = makeQuote({ status: 'DRAFT' })
    await quotesRepository.create(quote)

    const result = await sut.execute({
      quoteId: quote.id.toString(),
      discountType: 'PERCENT',
      discountValue: 15,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.quote.discountType).toBe('PERCENT')
      expect(result.value.quote.discountValue).toBe(15)
    }
  })

  it('should be able to assign a client to a quote', async () => {
    const client = makeClient()
    await clientsRepository.create(client)

    const quote = makeQuote({ status: 'DRAFT' })
    await quotesRepository.create(quote)

    const result = await sut.execute({
      quoteId: quote.id.toString(),
      clientId: client.id.toString(),
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.quote.clientId?.toString()).toBe(client.id.toString())
    }
  })

  it('should be able to clear the client by passing null', async () => {
    const client = makeClient()
    await clientsRepository.create(client)

    const quote = makeQuote({ status: 'DRAFT', clientId: client.id })
    await quotesRepository.create(quote)

    const result = await sut.execute({
      quoteId: quote.id.toString(),
      clientId: null,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.quote.clientId).toBeNull()
    }
  })

  it('should not touch clientId when not provided', async () => {
    const client = makeClient()
    await clientsRepository.create(client)

    const quote = makeQuote({ status: 'DRAFT', clientId: client.id })
    await quotesRepository.create(quote)

    const result = await sut.execute({
      quoteId: quote.id.toString(),
      notes: 'Apenas notas',
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.quote.clientId?.toString()).toBe(client.id.toString())
    }
  })

  it('should return ResourceNotFoundError when quote does not exist', async () => {
    const result = await sut.execute({
      quoteId: 'non-existent-id',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return ResourceNotFoundError when clientId does not exist', async () => {
    const quote = makeQuote({ status: 'DRAFT' })
    await quotesRepository.create(quote)

    const result = await sut.execute({
      quoteId: quote.id.toString(),
      clientId: 'non-existent-client',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should return QuoteNotEditableError for non-DRAFT statuses', async () => {
    for (const status of ['SENT', 'APPROVED', 'REJECTED', 'EXPIRED'] as const) {
      const quote = makeQuote({ status })
      await quotesRepository.create(quote)

      const result = await sut.execute({
        quoteId: quote.id.toString(),
        notes: 'Tentativa de edição',
      })

      expect(result.isLeft()).toBe(true)
      expect(result.value).toBeInstanceOf(QuoteNotEditableError)
    }
  })
})
