import { InMemoryQuotesRepository } from 'test/repositories/in-memory-quotes-repository'
import { InMemoryClientsRepository } from 'test/repositories/in-memory-clients-repository'
import { CreateQuoteUseCase } from './create-quote'
import { makeClient } from 'test/factories/make-client'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

let quotesRepository: InMemoryQuotesRepository
let clientsRepository: InMemoryClientsRepository
let sut: CreateQuoteUseCase

describe('Create Quote Use Case', () => {
  beforeEach(() => {
    quotesRepository = new InMemoryQuotesRepository()
    clientsRepository = new InMemoryClientsRepository()
    sut = new CreateQuoteUseCase(quotesRepository, clientsRepository)
  })

  it('should be able to create a quote without a client', async () => {
    const result = await sut.execute({
      createdById: 'user-01',
    })

    expect(result.isRight()).toBe(true)
    expect(quotesRepository.items).toHaveLength(1)
    expect(quotesRepository.items[0].code).toMatch(/^ORC-\d{4}-[0-9A-Z]{5}-GEN$/)
    expect(quotesRepository.items[0].clientId).toBeNull()
  })

  it('should be able to create a quote with a client (numeric document suffix)', async () => {
    const client = makeClient({ document: '12345678901' })
    await clientsRepository.create(client)

    const result = await sut.execute({
      clientId: client.id.toString(),
      createdById: 'user-01',
    })

    expect(result.isRight()).toBe(true)
    expect(quotesRepository.items[0].code).toMatch(/^ORC-\d{4}-[0-9A-Z]{5}-8901$/)
    expect(quotesRepository.items[0].clientId?.toString()).toBe(client.id.toString())
  })

  it('should be able to create a quote with optional fields', async () => {
    const result = await sut.execute({
      createdById: 'user-01',
      notes: 'Orçamento de teste',
      validUntil: new Date('2026-12-31'),
      discountType: 'AMOUNT',
      discountValue: 100,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      const { quote } = result.value
      expect(quote.notes).toBe('Orçamento de teste')
      expect(quote.discountType).toBe('AMOUNT')
      expect(quote.discountValue).toBe(100)
      expect(quote.status).toBe('DRAFT')
    }
  })

  it('should be able to create a quote with PERCENT discount', async () => {
    const result = await sut.execute({
      createdById: 'user-01',
      discountType: 'PERCENT',
      discountValue: 10,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.quote.discountType).toBe('PERCENT')
      expect(result.value.quote.discountValue).toBe(10)
    }
  })

  it('should generate code in ORC-YYMM-ID-CLI format', async () => {
    const result = await sut.execute({ createdById: 'user-01' })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      const code = result.value.quote.code
      expect(code).toMatch(/^ORC-\d{4}-[0-9A-Z]{5}-[A-Z0-9]+$/)
    }
  })

  it('should not be able to create a quote with a non-existing client', async () => {
    const result = await sut.execute({
      clientId: 'non-existing-client-id',
      createdById: 'user-01',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})