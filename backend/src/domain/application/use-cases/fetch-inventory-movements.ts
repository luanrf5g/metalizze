import { Either, right } from "@/core/logic/Either"
import { InventoryMovement } from "@/domain/enterprise/entities/inventory-movement"
import { Injectable } from "@nestjs/common"
import { InventoryMovementsRepository } from "../repositories/inventory-movements-repository"

interface FetchInventoryMovementUseCaseRequest {
  page: number,
  sheetId?: string
}

type FetchInventoryMovementUseCaseResponse = Either<
  null,
  {
    movements: InventoryMovement[]
  }
>

@Injectable()
export class FetchInventoryMovementsUseCase {
  constructor(private inventoryMovementsRepository: InventoryMovementsRepository) { }

  async execute({
    page,
    sheetId
  }: FetchInventoryMovementUseCaseRequest): Promise<FetchInventoryMovementUseCaseResponse> {
    const movements = await this.inventoryMovementsRepository.findMany({
      page,
      sheetId
    })

    return right({
      movements
    })
  }
}