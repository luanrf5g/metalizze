import { PaginationParams } from "@/core/repositories/pagination-params";
import { Client } from "@/domain/enterprise/entities/client";

export abstract class ClientsRepository {
  abstract findById(id: string): Promise<Client | null>
  abstract findByDocument(document: string): Promise<Client | null>
  abstract findMany(params: PaginationParams): Promise<Client[]>
  abstract create(client: Client): Promise<void>
  abstract save(client: Client): Promise<void>
  abstract delete(id: string): Promise<void>
}