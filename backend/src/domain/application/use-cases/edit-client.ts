import { ResourceNotFoundError } from "@/core/errors/errors/resource-not-found-error";
import { Either, left, right } from "@/core/logic/Either";
import { Client } from "@/domain/enterprise/entities/client";
import { Injectable } from "@nestjs/common";
import { ClientsRepository } from "../repositories/clients-repository";

interface EditClientUseCaseRequest {
  clientId: string,
  name?: string,
  email?: string | null,
  phone?: string | null
}

type EditClientUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    client: Client
  }
>

@Injectable()
export class EditClientUseCase {
  constructor(private clientsRepository: ClientsRepository) { }

  async execute({
    clientId,
    name,
    email,
    phone
  }: EditClientUseCaseRequest): Promise<EditClientUseCaseResponse> {
    const client = await this.clientsRepository.findById(clientId)

    if (!client) {
      return left(new ResourceNotFoundError())
    }

    if (name) client.name = name
    if (email !== undefined) client.email = email
    if (phone !== undefined) client.phone = phone

    await this.clientsRepository.save(client)

    return right({
      client,
    })
  }
}