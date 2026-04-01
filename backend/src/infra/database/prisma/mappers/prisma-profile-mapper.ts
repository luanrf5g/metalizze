import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { Profile } from "@/domain/enterprise/entities/profile";
import { Prisma, Profile as PrismaProfile } from "@prisma/client";

export class PrismaProfileMapper {
  static toDomain(raw: PrismaProfile): Profile {
    return Profile.create(
      {
        materialId: new UniqueEntityId(raw.materialId),
        clientId: raw.clientId ? new UniqueEntityId(raw.clientId) : null,
        sku: raw.sku,
        profileType: raw.profileType,
        width: raw.width,
        height: raw.height,
        length: raw.length,
        thickness: raw.thickness,
        quantity: raw.quantity,
        price: raw.price,
        storageLocation: raw.storageLocation,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        deletedAt: raw.deletedAt,
      },
      new UniqueEntityId(raw.id)
    )
  }

  static toPrisma(profile: Profile): Prisma.ProfileUncheckedCreateInput {
    return {
      id: profile.id.toString(),
      materialId: profile.materialId.toString(),
      clientId: profile.clientId?.toString() ?? null,
      sku: profile.sku,
      profileType: profile.profileType,
      width: profile.width,
      height: profile.height,
      length: profile.length,
      thickness: profile.thickness,
      quantity: profile.quantity,
      price: profile.price,
      storageLocation: profile.storageLocation,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      deletedAt: profile.deletedAt
    }
  }
}
