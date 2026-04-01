import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { Profile, ProfileType } from "@/domain/enterprise/entities/profile";
import { Injectable } from "@nestjs/common";
import { ProfilesRepository } from "../repositories/profiles-repository";
import { Either, left, right } from "@/core/logic/Either";
import { ResourceNotFoundError } from "@/core/errors/errors/resource-not-found-error";
import { MaterialsRepository } from "../repositories/materials-repository";
import { ClientsRepository } from "../repositories/clients-repository";
import { SkuGenerator } from "../services/sku-generator";

interface EditProfileUseCaseRequest {
  profileId: string
  materialId?: string
  clientId?: string | null
  profileType?: ProfileType
  width?: number
  height?: number
  length?: number
  thickness?: number
  price?: number
  storageLocation?: string | null
}

type EditProfileUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    profile: Profile
  }
>

@Injectable()
export class EditProfileUseCase {
  constructor(
    private profilesRepository: ProfilesRepository,
    private materialsRepository: MaterialsRepository,
    private clientsRepository: ClientsRepository
  ) { }

  async execute({
    profileId, materialId, clientId, profileType, width, height, length, thickness, price, storageLocation
  }: EditProfileUseCaseRequest): Promise<EditProfileUseCaseResponse> {
    const profile = await this.profilesRepository.findById(profileId)

    if (!profile) {
      return left(new ResourceNotFoundError())
    }

    if (profileType) profile.profileType = profileType
    if (price !== undefined) profile.price = price
    if (storageLocation !== undefined) profile.storageLocation = storageLocation

    if (clientId !== undefined) {
      profile.clientId = clientId ? new UniqueEntityId(clientId) : null
    }

    const hasDimensionsChanged = width || height || length || thickness
    const hasMaterialChanged = materialId && materialId !== profile.materialId.toString()
    const hasClientChanged = clientId !== undefined
    const hasTypeChanged = profileType && profileType !== profile.profileType

    if (width) profile.width = width
    if (height) profile.height = height
    if (length) profile.length = length
    if (thickness) profile.thickness = thickness
    if (materialId) profile.materialId = new UniqueEntityId(materialId)

    if (hasDimensionsChanged || hasMaterialChanged || hasClientChanged || hasTypeChanged) {
      const currentMaterialId = materialId ?? profile.materialId.toString()
      const material = await this.materialsRepository.findById(currentMaterialId)

      if (!material) return left(new ResourceNotFoundError())

      let clientName = null
      if (profile.clientId) {
        const client = await this.clientsRepository.findById(profile.clientId.toString())
        if (!client) return left(new ResourceNotFoundError())
        if (client) clientName = client.name
      }

      const newSku = SkuGenerator.generateProfileSku({
        materialSlug: material.slug.value,
        profileType: profile.profileType,
        width: profile.width,
        height: profile.height,
        length: profile.length,
        thickness: profile.thickness,
        clientName: clientName
      })

      profile.sku = newSku
    }

    await this.profilesRepository.save(profile)

    return right({ profile })
  }
}
