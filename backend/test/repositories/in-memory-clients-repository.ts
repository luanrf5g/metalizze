import { PaginationParams } from "@/core/repositories/pagination-params";
import { ClientsRepository } from "@/domain/application/repositories/clients-repository";
import { Client } from "@/domain/enterprise/entities/client";

export class InMemoryClientsRepository implements ClientsRepository {
  public items: Client[] = []

  async create(client: Client) {
    this.items.push(client)
  }

  async save(client: Client) {
    const itemIndex = this.items.findIndex((item) => item.id === client.id)

    this.items[itemIndex] = client
  }

  async findById(id: string) {
    const client = this.items.find((item) => item.id.toString() === id)

    if (!client) return null

    return client
  }

  async findByDocument(document: string) {
    const client = this.items.find((item) => item.document === document)

    if (!client) return null

    return client
  }

  async delete(id: string) {
    const itemIndex = this.items.findIndex((item) => item.id.toString() === id)

    this.items.splice(itemIndex, 1)
  }

  async findMany({ page }: PaginationParams) {
    const clients = this.items
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice((page - 1) * 15, page * 15)

    return clients
  }
}