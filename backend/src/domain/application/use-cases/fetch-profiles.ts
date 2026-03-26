import { Injectable } from "@nestjs/common";
import { ProfilesRepository } from "../repositories/profiles-repository";
import { Either, right } from "@/core/logic/Either";
import { ProfileWithDetails } from "@/domain/enterprise/value-objects/profile-with-details";
import { ProfileType } from "@/domain/enterprise/entities/profile";

interface FetchProfilesUseCaseRequest {
  page: number
  materialId?: string | null
  clientId?: string | null
  profileType?: ProfileType | null
}

type FetchProfilesUseCaseResponse = Either<
  null,
  {
    profiles: ProfileWithDetails[]
    totalCount: number
  }
>

@Injectable()
export class FetchProfilesUseCase {
  constructor(private profilesRepository: ProfilesRepository) { }

  async execute({
    page,
    materialId,
    clientId,
    profileType
  }: FetchProfilesUseCaseRequest): Promise<FetchProfilesUseCaseResponse> {
    const profiles = await this.profilesRepository.findMany({
      page,
      materialId,
      clientId,
      profileType
    })

    const totalCount = await this.profilesRepository.count({
      materialId,
      clientId,
      profileType
    })

    return right({
      profiles,
      totalCount
    })
  }
}
