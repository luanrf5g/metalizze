import { Either, left, right } from "@/core/logic/Either"
import { Client } from "@/domain/enterprise/entities/client"
import { ClientAlreadyExistsError } from "./errors/client-already-exists"
import { Injectable } from "@nestjs/common"
import { ClientsRepository } from "../repositories/clients-repository"

interface RegisterClientUseCaseRequest {
  name: string,
  document: string,
  phone?: string | null,
  email?: string | null
}

type RegisterClientUseCaseResponse = Either<
  ClientAlreadyExistsError,
  {
    client: Client
  }
>

@Injectable()
export class RegisterClientUseCase {
  constructor(private clientsRepository: ClientsRepository) { }

  async execute({
    name,
    document,
    phone,
    email
  }: RegisterClientUseCaseRequest): Promise<RegisterClientUseCaseResponse> {
    const clientWithSameDocumento = await this.clientsRepository.findByDocument(
      document
    )

    if (clientWithSameDocumento) {
      return left(new ClientAlreadyExistsError(document))
    }

    const client = Client.create({
      name,
      document,
      phone,
      email
    })

    await this.clientsRepository.create(client)

    return right({
      client
    })
  }
}