import { PaginationParams } from "@/core/repositories/pagination-params";
import { Profile, ProfileType } from "@/domain/enterprise/entities/profile";
import { ProfileWithDetails } from "@/domain/enterprise/value-objects/profile-with-details";

export interface FindManyProfilesParams extends PaginationParams {
  materialId?: string | null
  clientId?: string | null
  profileType?: ProfileType | null
}

export abstract class ProfilesRepository {
  abstract create(profile: Profile): Promise<void>
  abstract save(profile: Profile): Promise<void>
  abstract delete(id: string): Promise<void>
  abstract countByClientId(clientId: string): Promise<number>
  abstract countByMaterialId(materialId: string): Promise<number>
  abstract findById(id: string): Promise<Profile | null>
  abstract findByDetails(
    materialId: string,
    profileType: ProfileType,
    width: number,
    height: number,
    length: number,
    thickness: number,
    clientId: string | null
  ): Promise<Profile | null>
  abstract findMany(params: FindManyProfilesParams): Promise<ProfileWithDetails[]>
  abstract findAll(params: Omit<FindManyProfilesParams, 'page'>): Promise<ProfileWithDetails[]>
  abstract count(params: Omit<FindManyProfilesParams, 'page'>): Promise<number>
}
