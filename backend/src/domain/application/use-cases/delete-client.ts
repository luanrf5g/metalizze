import { ResourceNotFoundError } from "@/core/errors/errors/resource-not-found-error";
import { Either, left, right } from "@/core/logic/Either";
import { Injectable } from "@nestjs/common";
import { ClientHasSheetsError } from "./errors/client-has-sheets-error";
import { ClientsRepository } from "../repositories/clients-repository";
import { SheetsRepository } from "../repositories/sheets-repository";
import { ProfilesRepository } from "../repositories/profiles-repository";

interface DeleteClientUseCaseRequest {
  clientId: string
}

type DeleteClientUseCaseResponse = Either<
  ResourceNotFoundError | ClientHasSheetsError,
  object
>

@Injectable()
export class DeleteClientUseCase {
  constructor(
    private clientsRepository: ClientsRepository,
    private sheetsRepository: SheetsRepository,
    private profilesRepository: ProfilesRepository
  ) { }

  async execute({
    clientId
  }: DeleteClientUseCaseRequest): Promise<DeleteClientUseCaseResponse> {
    const client = await this.clientsRepository.findById(clientId)

    if (!client) {
      return left(new ResourceNotFoundError())
    }

    const countSheets = await this.sheetsRepository.countByClientId(clientId)
    const countProfiles = await this.profilesRepository.countByClientId(clientId)

    if (countSheets > 0 || countProfiles > 0) {
      return left(new ClientHasSheetsError(client.name))
    }

    await this.clientsRepository.delete(clientId)

    return right({})
  }
}