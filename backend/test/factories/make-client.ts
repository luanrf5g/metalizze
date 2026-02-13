import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { Client, ClientProps } from "@/domain/enterprise/entities/client";
import { PrismaClientMapper } from "@/infra/database/prisma/mappers/prisma-client-mapper";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { faker } from "@faker-js/faker";
import { Injectable } from "@nestjs/common";

export function makeClient(
  override: Partial<ClientProps> = {},
  id?: UniqueEntityId
) {
  const client = Client.create(
    {
      name: faker.person.fullName(),
      document: faker.helpers.replaceCreditCardSymbols('###########'),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      ...override
    },
    id,
  )

  return client
}

@Injectable()
export class ClientFactory {
  constructor(private prisma: PrismaService) { }

  async makePrismaClient(data: Partial<ClientProps> = {}): Promise<Client> {
    const client = makeClient(data)

    await this.prisma.client.create({
      data: PrismaClientMapper.toPrisma(client)
    })

    return client
  }
}