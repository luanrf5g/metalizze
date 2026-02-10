import { ClientsRepository } from "@/domain/application/repositories/clients-repository";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { Client } from "@/domain/enterprise/entities/client";
import { PrismaClientMapper } from "../mappers/prisma-client-mapper";
import { PaginationParams } from "@/core/repositories/pagination-params";

@Injectable()
export class PrismaClientsRepository implements ClientsRepository {
  constructor(private prisma: PrismaService) { }

  async create(client: Client) {
    const data = PrismaClientMapper.toPrisma(client)

    await this.prisma.client.create({
      data
    })
  }

  async save(client: Client) {
    const data = PrismaClientMapper.toPrisma(client)

    await this.prisma.client.update({
      where: {
        id: client.id.toString()
      },
      data
    })
  }

  async findById(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id }
    })

    if (!client) return null

    return PrismaClientMapper.toDomain(client)
  }

  async findByDocument(document: string) {
    const client = await this.prisma.client.findUnique({
      where: { document }
    })

    if (!client) return null

    return PrismaClientMapper.toDomain(client)
  }

  async delete(id: string) {
    await this.prisma.client.delete({
      where: { id }
    })
  }

  async findMany({ page }: PaginationParams) {
    const clients = await this.prisma.client.findMany({
      take: 15,
      skip: (page - 1) * 15,
    })

    return clients.map(PrismaClientMapper.toDomain)
  }
}