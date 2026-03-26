import { Injectable } from "@nestjs/common";
import { ProfilesRepository } from "../repositories/profiles-repository";
import { Either, left, right } from "@/core/logic/Either";
import { ResourceNotFoundError } from "@/core/errors/errors/resource-not-found-error";

interface DeleteProfileUseCaseRequest {
  profileId: string
}

type DeleteProfileUseCaseResponse = Either<
  ResourceNotFoundError,
  object
>

@Injectable()
export class DeleteProfileUseCase {
  constructor(private profilesRepository: ProfilesRepository) { }

  async execute({
    profileId
  }: DeleteProfileUseCaseRequest): Promise<DeleteProfileUseCaseResponse> {
    const profile = await this.profilesRepository.findById(profileId)

    if (!profile) {
      return left(new ResourceNotFoundError())
    }

    profile.delete()

    await this.profilesRepository.save(profile)

    return right({})
  }
}
