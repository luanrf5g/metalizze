import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ProfileWithDetails } from '@/domain/enterprise/value-objects/profile-with-details'
import { Profile as PrismaProfile, Client as PrismaClient, Material as PrismaMaterial } from '@prisma/client'

type PrismaProfileWithClientAndMaterial = PrismaProfile & {
  client: PrismaClient | null,
  material: PrismaMaterial
}

export class PrismaProfileWithDetailsMapper {
  static toDomain(raw: PrismaProfileWithClientAndMaterial): ProfileWithDetails {
    return ProfileWithDetails.create({
      id: new UniqueEntityId(raw.id),
      sku: raw.sku,
      profileType: raw.profileType,
      width: raw.width,
      height: raw.height,
      length: raw.length,
      thickness: raw.thickness,
      materialId: new UniqueEntityId(raw.materialId),
      material: {
        id: new UniqueEntityId(raw.material.id),
        name: raw.material.name,
        slug: raw.material.slug
      },
      quantity: raw.quantity,
      price: raw.price ?? 0,
      createdAt: raw.createdAt,
      client: raw.client ? {
        id: new UniqueEntityId(raw.client.id),
        name: raw.client.name,
        document: raw.client.document
      } : null
    })
  }
}
