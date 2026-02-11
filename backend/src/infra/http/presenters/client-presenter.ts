import { Client } from "@/domain/enterprise/entities/client";

export class ClientPresenter {
  static toHTTP(client: Client) {
    return {
      name: client.name,
      document: client.document,
    }
  }
}