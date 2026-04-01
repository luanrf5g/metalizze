import { ResourceNotFoundError } from "@/core/errors/errors/resource-not-found-error";
import { Either, left, right } from "@/core/logic/Either";
import { InsufficientStockError } from "./errors/insufficient-stock-error";
import { Injectable } from "@nestjs/common";
import { ProfilesRepository } from "../repositories/profiles-repository";
import { MaterialsRepository } from "../repositories/materials-repository";
import { ClientsRepository } from "../repositories/clients-repository";
import { InventoryMovementsRepository } from "../repositories/inventory-movements-repository";
import { InventoryMovement } from "@/domain/enterprise/entities/inventory-movement";
import { Profile } from "@/domain/enterprise/entities/profile";
import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { SkuGenerator } from "../services/sku-generator";

interface LeftoverInput {
  length: number
  quantity: number
}

interface RegisterProfileCutUseCaseRequest {
  profileId: string
  quantityToCut: number
  description?: string
  leftovers?: LeftoverInput[]
}

type RegisterProfileCutUseCaseResponse = Either<
  ResourceNotFoundError | InsufficientStockError,
  null
>

@Injectable()
export class RegisterProfileCutUseCase {
  constructor(
    private profilesRepository: ProfilesRepository,
    private materialsRepository: MaterialsRepository,
    private clientsRepository: ClientsRepository,
    private inventoryMovementsRepository: InventoryMovementsRepository
  ) { }

  async execute({
    profileId,
    quantityToCut,
    description,
    leftovers = []
  }: RegisterProfileCutUseCaseRequest): Promise<RegisterProfileCutUseCaseResponse> {
    const motherProfile = await this.profilesRepository.findById(profileId)

    if (!motherProfile) return left(new ResourceNotFoundError())

    if (motherProfile.quantity < quantityToCut) return left(new InsufficientStockError())

    const material = await this.materialsRepository.findById(motherProfile.materialId.toString())
    if (!material) return left(new ResourceNotFoundError())

    // Reduce original profile stock
    motherProfile.decreaseStock(quantityToCut)
    await this.profilesRepository.save(motherProfile)

    const hasLeftovers = leftovers.length > 0
    const totalLeftoverQuantity = leftovers.reduce((sum, l) => sum + l.quantity, 0)

    // EXIT movement for mother profile
    const outMovement = InventoryMovement.create({
      profileId: motherProfile.id,
      type: 'EXIT',
      quantity: quantityToCut,
      description: description ?? (
        hasLeftovers
          ? `Corte de perfil. ${totalLeftoverQuantity} sobra(s) será(ão) registrada(s).`
          : `Corte de perfil. Sem sobra de material.`
      )
    })
    await this.inventoryMovementsRepository.create(outMovement)

    // Resolve client name once if needed
    let clientName: string | null = null
    if (motherProfile.clientId) {
      const client = await this.clientsRepository.findById(motherProfile.clientId.toString())
      if (client) clientName = client.name
    }

    // Process each leftover entry
    for (const leftover of leftovers) {
      const existingLeftover = await this.profilesRepository.findByDetails(
        motherProfile.materialId.toString(),
        motherProfile.profileType,
        motherProfile.width,
        motherProfile.height,
        leftover.length,
        motherProfile.thickness,
        motherProfile.clientId?.toString() ?? null
      )

      let leftoverProfileId: UniqueEntityId

      if (existingLeftover) {
        existingLeftover.increaseStock(leftover.quantity)
        await this.profilesRepository.save(existingLeftover)
        leftoverProfileId = existingLeftover.id
      } else {
        const sku = SkuGenerator.generateProfileSku({
          materialSlug: material.slug.value,
          profileType: motherProfile.profileType,
          width: motherProfile.width,
          height: motherProfile.height,
          length: leftover.length,
          thickness: motherProfile.thickness,
          clientName
        })

        // Proportional price based on length
        const motherLength = motherProfile.length
        const motherPrice = motherProfile.price ?? 0
        let leftoverPrice: number | undefined

        if (motherLength > 0 && motherPrice > 0) {
          const proportion = leftover.length / motherLength
          leftoverPrice = motherPrice * proportion
        }

        const newProfile = Profile.create({
          materialId: motherProfile.materialId,
          clientId: motherProfile.clientId ? new UniqueEntityId(motherProfile.clientId.toString()) : null,
          sku,
          profileType: motherProfile.profileType,
          width: motherProfile.width,
          height: motherProfile.height,
          length: leftover.length,
          thickness: motherProfile.thickness,
          quantity: leftover.quantity,
          price: leftoverPrice,
          storageLocation: motherProfile.storageLocation,
        })

        await this.profilesRepository.create(newProfile)
        leftoverProfileId = newProfile.id
      }

      // ENTRY movement for leftover profile
      const entryMovement = InventoryMovement.create({
        profileId: leftoverProfileId,
        type: 'ENTRY',
        quantity: leftover.quantity,
        description: `Sobra do corte do perfil: ${motherProfile.sku}`
      })
      await this.inventoryMovementsRepository.create(entryMovement)
    }

    return right(null)
  }
}
