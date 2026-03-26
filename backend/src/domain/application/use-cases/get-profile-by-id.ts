import { ResourceNotFoundError } from "@/core/errors/errors/resource-not-found-error";
import { Either, left, right } from "@/core/logic/Either";
import { Injectable } from "@nestjs/common";
import { ProfilesRepository } from "../repositories/profiles-repository";
import { Profile } from "@/domain/enterprise/entities/profile";

interface GetProfileByIdUseCaseRequest {
  id: string
}

type GetProfileByIdUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    profile: Profile
  }
>

@Injectable()
export class GetProfileByIdUseCase {
  constructor(private profilesRepository: ProfilesRepository) { }

  async execute({
    id
  }: GetProfileByIdUseCaseRequest): Promise<GetProfileByIdUseCaseResponse> {
    const profile = await this.profilesRepository.findById(id)

    if (!profile) {
      return left(new ResourceNotFoundError())
    }

    return right({
      profile
    })
  }
}
