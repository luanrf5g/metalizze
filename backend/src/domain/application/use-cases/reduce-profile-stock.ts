import { ResourceNotFoundError } from "@/core/errors/errors/resource-not-found-error";
import { Either, left, right } from "@/core/logic/Either";
import { InsufficientStockError } from "./errors/insufficient-stock-error";
import { Profile } from "@/domain/enterprise/entities/profile";
import { ProfilesRepository } from "../repositories/profiles-repository";
import { InventoryMovementsRepository } from "../repositories/inventory-movements-repository";
import { InventoryMovement } from "@/domain/enterprise/entities/inventory-movement";
import { Injectable } from "@nestjs/common";

interface ReduceProfileStockUseCaseRequest {
  profileId: string
  quantity: number
  description?: string
}

type ReduceProfileStockUseCaseResponse = Either<
  ResourceNotFoundError | InsufficientStockError,
  {
    profile: Profile
  }
>

@Injectable()
export class ReduceProfileStockUseCase {
  constructor(
    private profilesRepository: ProfilesRepository,
    private inventoryMovementsRepository: InventoryMovementsRepository
  ) { }

  async execute({
    profileId,
    quantity,
    description
  }: ReduceProfileStockUseCaseRequest): Promise<ReduceProfileStockUseCaseResponse> {
    const profile = await this.profilesRepository.findById(profileId)

    if (!profile) {
      return left(new ResourceNotFoundError())
    }

    if (profile.quantity < quantity) {
      return left(new InsufficientStockError)
    }

    profile.decreaseStock(quantity)
    await this.profilesRepository.save(profile)

    const movement = InventoryMovement.create({
      profileId: profile.id,
      quantity: quantity,
      type: 'EXIT',
      description
    })

    await this.inventoryMovementsRepository.create(movement)

    return right({
      profile,
    })
  }
}
