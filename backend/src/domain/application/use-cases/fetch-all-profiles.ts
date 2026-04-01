import { Injectable } from "@nestjs/common";
import { ProfilesRepository } from "../repositories/profiles-repository";
import { Either, right } from "@/core/logic/Either";
import { ProfileWithDetails } from "@/domain/enterprise/value-objects/profile-with-details";
import { ProfileType } from "@/domain/enterprise/entities/profile";

interface FetchAllProfilesUseCaseRequest {
  materialId?: string | null
  clientId?: string | null
  profileType?: ProfileType | null
}

type FetchAllProfilesUseCaseResponse = Either<
  null,
  {
    profiles: ProfileWithDetails[]
  }
>

@Injectable()
export class FetchAllProfilesUseCase {
  constructor(private profilesRepository: ProfilesRepository) { }

  async execute({
    materialId,
    clientId,
    profileType
  }: FetchAllProfilesUseCaseRequest): Promise<FetchAllProfilesUseCaseResponse> {
    const profiles = await this.profilesRepository.findAll({
      materialId,
      clientId,
      profileType
    })

    return right({
      profiles
    })
  }
}
