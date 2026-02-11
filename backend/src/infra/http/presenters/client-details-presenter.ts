import { Client } from "@/domain/enterprise/entities/client";

export class ClientDetailsPresenter {
  static toHTTP(client: Client) {
    return {
      id: client.id.toString(),
      name: client.name,
      document: client.document,
      email: client.email,
      phone: client.phone,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt
    }
  }
}