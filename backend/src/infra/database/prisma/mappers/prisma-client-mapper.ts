import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { Client } from '@/domain/enterprise/entities/client';
import { Prisma, Client as PrismaClient } from '@prisma/client'

export class PrismaClientMapper {
  static toDomain(raw: PrismaClient): Client {
    return Client.create(
      {
        name: raw.name,
        document: raw.document,
        phone: raw.phone,
        email: raw.email,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityId(raw.id)
    )
  }

  static toPrisma(client: Client): Prisma.ClientUncheckedCreateInput {
    return {
      id: client.id.toString(),
      name: client.name,
      document: client.document,
      phone: client.phone,
      email: client.email,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    }
  }
}