import { Client } from "@/domain/enterprise/entities/client";

export abstract class ClientsRepository {
  abstract create(client: Client): Promise<void>
  abstract save(client: Client): Promise<void>
  abstract findById(id: string): Promise<Client | null>
  abstract findByDocument(document: string): Promise<Client | null>
}