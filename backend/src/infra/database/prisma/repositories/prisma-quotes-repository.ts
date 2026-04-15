import { Injectable } from "@nestjs/common";
import { QuotesRepository, FetchQuotesParams, FetchQuotesResult } from "@/domain/application/repositories/quotes-repository";
import { Quote } from "@/domain/enterprise/entities/quote";
import { QuoteItem } from "@/domain/enterprise/entities/quote-item";
import { QuoteItemService } from "@/domain/enterprise/entities/quote-item-service";
import { QuoteWithItems } from "@/domain/enterprise/value-objects/quote-with-items";
import { QuoteListEntry } from "@/domain/enterprise/value-objects/quote-list-entry";
import { PrismaService } from "../prisma.service";
import { PrismaQuoteMapper } from "../mappers/prisma-quote-mapper";
import { PrismaQuoteItemMapper } from "../mappers/prisma-quote-item-mapper";
import { PrismaQuoteItemServiceMapper } from "../mappers/prisma-quote-item-service-mapper";

@Injectable()
export class PrismaQuotesRepository implements QuotesRepository {
  constructor(private prisma: PrismaService) { }

  async create(quote: Quote): Promise<void> {
    const data = PrismaQuoteMapper.toPrisma(quote)
    await this.prisma.quote.create({ data })
  }

  async save(quote: Quote): Promise<void> {
    const data = PrismaQuoteMapper.toPrisma(quote)
    await this.prisma.quote.update({
      where: { id: quote.id.toString() },
      data,
    })
  }

  async findById(id: string): Promise<Quote | null> {
    const raw = await this.prisma.quote.findUnique({ where: { id } })
    if (!raw) return null
    return PrismaQuoteMapper.toDomain(raw)
  }

  async findByCode(code: string): Promise<Quote | null> {
    const raw = await this.prisma.quote.findUnique({ where: { code } })
    if (!raw) return null
    return PrismaQuoteMapper.toDomain(raw)
  }

  async findWithItemsById(id: string): Promise<QuoteWithItems | null> {
    const raw = await this.prisma.quote.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
        items: {
          include: {
            services: {
              include: {
                service: { select: { name: true, unitLabel: true } },
              },
            },
          },
          orderBy: { partNumber: 'asc' },
        },
      },
    })

    if (!raw) return null

    const quote = PrismaQuoteMapper.toDomain(raw)
    const items = raw.items.map((rawItem) => ({
      item: PrismaQuoteItemMapper.toDomain(rawItem),
      services: rawItem.services.map(PrismaQuoteItemServiceMapper.toDomain),
    }))

    return QuoteWithItems.create({
      quote,
      items,
      client: raw.client ?? null,
      createdBy: raw.createdBy,
    })
  }

  async countItemsByQuoteId(quoteId: string): Promise<number> {
    return this.prisma.quoteItem.count({ where: { quoteId } })
  }

  async addItem(item: QuoteItem, services: QuoteItemService[]): Promise<void> {
    const itemData = PrismaQuoteItemMapper.toPrisma(item)
    const servicesData = services.map(PrismaQuoteItemServiceMapper.toPrisma)

    await this.prisma.$transaction(async (tx) => {
      await tx.quoteItem.create({ data: itemData })

      if (servicesData.length > 0) {
        await tx.quoteItemService.createMany({ data: servicesData })
      }
    })
  }

  async findItemById(itemId: string): Promise<QuoteItem | null> {
    const raw = await this.prisma.quoteItem.findUnique({ where: { id: itemId } })
    if (!raw) return null
    return PrismaQuoteItemMapper.toDomain(raw)
  }

  async saveItem(item: QuoteItem): Promise<void> {
    const data = PrismaQuoteItemMapper.toPrisma(item)
    await this.prisma.quoteItem.update({
      where: { id: item.id.toString() },
      data,
    })
  }

  async removeItem(itemId: string): Promise<void> {
    await this.prisma.quoteItem.delete({ where: { id: itemId } })
  }

  async replaceItemServices(itemId: string, services: QuoteItemService[]): Promise<void> {
    const servicesData = services.map(PrismaQuoteItemServiceMapper.toPrisma)

    await this.prisma.$transaction(async (tx) => {
      await tx.quoteItemService.deleteMany({ where: { quoteItemId: itemId } })
      if (servicesData.length > 0) {
        await tx.quoteItemService.createMany({ data: servicesData })
      }
    })
  }

  async fetchAll(params: FetchQuotesParams): Promise<FetchQuotesResult> {
    const {
      page,
      perPage = 20,
      sortBy = 'updatedAt',
      sortOrder = 'desc',
      clientId,
      createdById,
      status,
      code,
      from,
      to,
    } = params

    const where = {
      ...(clientId != null ? { clientId } : {}),
      ...(createdById != null ? { createdById } : {}),
      ...(status != null && status.length > 0 ? { status: { in: status } } : {}),
      ...(code != null ? { code: { contains: code, mode: 'insensitive' as const } } : {}),
      ...(from != null || to != null
        ? {
          createdAt: {
            ...(from != null ? { gte: from } : {}),
            ...(to != null ? { lte: to } : {}),
          },
        }
        : {}),
    }

    const [raws, total] = await Promise.all([
      this.prisma.quote.findMany({
        where,
        include: {
          client: { select: { id: true, name: true } },
          createdBy: { select: { id: true, name: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        take: perPage,
        skip: (page - 1) * perPage,
      }),
      this.prisma.quote.count({ where }),
    ])

    return {
      quotes: raws.map((raw) =>
        QuoteListEntry.create({
          quote: PrismaQuoteMapper.toDomain(raw),
          client: raw.client ? { id: raw.client.id, name: raw.client.name } : null,
          createdBy: { id: raw.createdBy.id, name: raw.createdBy.name },
        }),
      ),
      total,
    }
  }
}
