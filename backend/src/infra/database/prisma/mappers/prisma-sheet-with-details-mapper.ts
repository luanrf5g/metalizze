import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { SheetWithDetails } from '@/domain/enterprise/value-objects/sheet-with-details'
import { Sheet as PrismaSheet, Client as PrismaClient } from '@prisma/client'

type PrismaSheetWithClient = PrismaSheet & {
  client: PrismaClient | null
}

export class PrismaSheetWithDetailsMapper {
  static toDomain(raw: PrismaSheetWithClient): SheetWithDetails {
    return SheetWithDetails.create({
      id: new UniqueEntityId(raw.id),
      sku: raw.sku,
      materialId: new UniqueEntityId(raw.materialId),
      quantity: raw.quantity,
      type: raw.type,
      createdAt: raw.createdAt,
      client: raw.client ? {
        id: new UniqueEntityId(raw.client.id),
        name: raw.client.name,
        document: raw.client.document
      } : null
    })
  }
}