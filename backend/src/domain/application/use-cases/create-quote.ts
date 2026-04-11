import { Injectable } from "@nestjs/common";
import { randomBytes } from "node:crypto";
import { Either, left, right } from "@/core/logic/Either";
import { QuotesRepository } from "../repositories/quotes-repository";
import { ClientsRepository } from "../repositories/clients-repository";
import { Quote, DiscountType } from "@/domain/enterprise/entities/quote";
import { Client } from "@/domain/enterprise/entities/client";
import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";
import { QuoteCodeCollisionError } from "./errors/quote-code-collision-error";

interface CreateQuoteUseCaseRequest {
  clientId?: string | null
  notes?: string | null
  validUntil?: Date | null
  createdById: string
  discountType?: DiscountType | null
  discountValue?: number | null
}

type CreateQuoteUseCaseResponse = Either<
  ResourceNotFoundError | QuoteCodeCollisionError,
  { quote: Quote }
>

@Injectable()
export class CreateQuoteUseCase {
  constructor(
    private quotesRepository: QuotesRepository,
    private clientsRepository: ClientsRepository,
  ) { }

  async execute({
    clientId,
    notes,
    validUntil,
    createdById,
    discountType,
    discountValue,
  }: CreateQuoteUseCaseRequest): Promise<CreateQuoteUseCaseResponse> {
    let client: Client | null = null

    if (clientId) {
      client = await this.clientsRepository.findById(clientId)
      if (!client) {
        return left(new ResourceNotFoundError())
      }
    }

    const code = await this.generateUniqueCode(client, new Date())

    if (!code) {
      return left(new QuoteCodeCollisionError())
    }

    const quote = Quote.create({
      code,
      clientId: clientId ? new UniqueEntityId(clientId) : null,
      notes: notes ?? null,
      validUntil: validUntil ?? null,
      createdById: new UniqueEntityId(createdById),
      discountType: discountType ?? null,
      discountValue: discountValue ?? null,
    })

    await this.quotesRepository.create(quote)

    return right({ quote })
  }

  private async generateUniqueCode(
    client: Client | null,
    now: Date,
  ): Promise<string | null> {
    const yymm =
      String(now.getFullYear()).slice(-2) +
      String(now.getMonth() + 1).padStart(2, '0')

    const cliSuffix = this.buildCliSuffix(client)

    for (let attempt = 0; attempt < 10; attempt++) {
      const id = this.generateBase36Id(5)
      const code = `ORC-${yymm}-${id}-${cliSuffix}`
      const existing = await this.quotesRepository.findByCode(code)
      if (!existing) return code
    }

    return null
  }

  private buildCliSuffix(client: Client | null): string {
    if (!client) return 'GEN'

    const digits = client.document.replace(/\D/g, '')

    if (digits.length >= 4) {
      return digits.slice(-4)
    }

    const letters = client.name
      .normalize('NFKD')
      .replace(/[^A-Za-z]/g, '')
      .toUpperCase()
      .slice(0, 3)

    return letters.length > 0 ? letters.padEnd(3, 'X') : 'CLI'
  }

  private generateBase36Id(length: number): string {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const bytes = randomBytes(length)
    return Array.from({ length }, (_, i) => chars[bytes[i] % 36]).join('')
  }
}
