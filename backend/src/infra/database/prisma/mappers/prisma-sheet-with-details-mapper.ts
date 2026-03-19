import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { SheetWithDetails } from '@/domain/enterprise/value-objects/sheet-with-details'
import { Sheet as PrismaSheet, Client as PrismaClient, Material as PrismaMaterial } from '@prisma/client'

type PrismaSheetWithClientAndMaterial = PrismaSheet & {
  client: PrismaClient | null,
  material: PrismaMaterial
}

export class PrismaSheetWithDetailsMapper {
  static toDomain(raw: PrismaSheetWithClientAndMaterial): SheetWithDetails {
    return SheetWithDetails.create({
      id: new UniqueEntityId(raw.id),
      sku: raw.sku,
      materialId: new UniqueEntityId(raw.materialId),
      material: {
        id: new UniqueEntityId(raw.material.id),
        name: raw.material.name,
        slug: raw.material.slug
      },
      quantity: raw.quantity,
      price: raw.price ?? 0,
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