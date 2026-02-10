import { ResourceNotFoundError } from "@/core/errors/errors/resource-not-found-error";
import { Either, left, right } from "@/core/logic/Either";
import { Client } from "@/domain/enterprise/entities/client";
import { Injectable } from "@nestjs/common";
import { ClientsRepository } from "../repositories/clients-repository";

interface GetClientByDocumentUseCaseRequest {
  document: string
}

type GetClientByDocumentUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    client: Client
  }
>

@Injectable()
export class GetClientByDocumentUseCase {
  constructor(private clientsRepository: ClientsRepository) { }

  async execute({
    document
  }: GetClientByDocumentUseCaseRequest): Promise<GetClientByDocumentUseCaseResponse> {
    const client = await this.clientsRepository.findByDocument(document)

    if (!client) {
      return left(new ResourceNotFoundError())
    }

    return right({
      client
    })
  }
}