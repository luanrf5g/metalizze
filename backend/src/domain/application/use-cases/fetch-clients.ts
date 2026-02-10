import { Injectable } from "@nestjs/common";
import { ClientsRepository } from "../repositories/clients-repository";
import { Either, right } from "@/core/logic/Either";
import { Client } from "@/domain/enterprise/entities/client";

interface FetchClientsUseCaseRequest {
  page: number
}

type FetchClientsUseCaseResponse = Either<
  null,
  {
    clients: Client[]
  }
>

@Injectable()
export class FetchClientsUseCase {
  constructor(private clientsRepository: ClientsRepository) { }

  async execute({
    page
  }: FetchClientsUseCaseRequest): Promise<FetchClientsUseCaseResponse> {
    const clients = await this.clientsRepository.findMany({
      page
    })

    return right({
      clients
    })
  }
}