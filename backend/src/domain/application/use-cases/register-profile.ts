import { ResourceNotFoundError } from "@/core/errors/errors/resource-not-found-error"
import { Either, left, right } from "@/core/logic/Either"
import { Profile, ProfileType } from "@/domain/enterprise/entities/profile"
import { ProfilesRepository } from "../repositories/profiles-repository"
import { MaterialsRepository } from "../repositories/materials-repository"
import { UniqueEntityId } from "@/core/entities/unique-entity-id"
import { Injectable } from "@nestjs/common"
import { ClientsRepository } from "../repositories/clients-repository"
import { InventoryMovementsRepository } from "../repositories/inventory-movements-repository"
import { InventoryMovement } from "@/domain/enterprise/entities/inventory-movement"
import { SkuGenerator } from "../services/sku-generator"

interface RegisterProfileUseCaseRequest {
  materialId: string
  clientId?: string | null
  profileType: ProfileType
  width: number
  height: number
  length: number
  thickness: number
  quantity: number
  price?: number | null
  description?: string
}

type RegisterProfileUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    profile: Profile
  }
>

@Injectable()
export class RegisterProfileUseCase {
  constructor(
    private profilesRepository: ProfilesRepository,
    private materialsRepository: MaterialsRepository,
    private clientsRepository: ClientsRepository,
    private inventoryMovementsRepository: InventoryMovementsRepository
  ) { }

  async execute({
    materialId,
    profileType,
    width,
    height,
    length,
    thickness,
    quantity,
    price,
    clientId = null,
    description
  }: RegisterProfileUseCaseRequest): Promise<RegisterProfileUseCaseResponse> {
    const material = await this.materialsRepository.findById(materialId)

    if (!material) {
      return left(new ResourceNotFoundError())
    }

    let clientName = null

    if (clientId) {
      const client = await this.clientsRepository.findById(clientId)

      if (!client) {
        return left(new ResourceNotFoundError())
      }

      clientName = client.name
    }

    const existingProfile = await this.profilesRepository.findByDetails(
      materialId,
      profileType,
      width,
      height,
      length,
      thickness,
      clientId
    )

    if (existingProfile) {
      existingProfile.increaseStock(quantity)

      if (price != null && price > 0) {
        existingProfile.updatePrice(price)
      }

      await this.profilesRepository.save(existingProfile)

      const movement = InventoryMovement.create({
        profileId: existingProfile.id,
        type: 'ENTRY',
        quantity,
        description: description ?? 'Entrada de Estoque (Adição de Perfil).'
      })
      await this.inventoryMovementsRepository.create(movement)

      return right({
        profile: existingProfile
      })
    }

    const finalSku = SkuGenerator.generateProfileSku({
      materialSlug: material.slug.value,
      profileType,
      width,
      height,
      length,
      thickness,
      clientName
    })

    const profile = Profile.create({
      materialId: new UniqueEntityId(materialId),
      clientId: clientId ? new UniqueEntityId(clientId) : null,
      profileType,
      width,
      height,
      length,
      thickness,
      quantity,
      price: price ?? 0,
      sku: finalSku
    })
    await this.profilesRepository.create(profile)

    const movement = InventoryMovement.create({
      profileId: profile.id,
      type: 'ENTRY',
      quantity,
      description: description ?? 'Entrada de Estoque (Novo Perfil).'
    })
    await this.inventoryMovementsRepository.create(movement)

    return right({
      profile
    })
  }
}
