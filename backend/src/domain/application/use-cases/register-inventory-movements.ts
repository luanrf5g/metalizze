import { ResourceNotFoundError } from "@/core/errors/errors/resource-not-found-error";
import { Either, left, right } from "@/core/logic/Either";
import { InsufficientStockError } from "./errors/insufficient-stock-error";
import { InventoryMovementsRepository } from "../repositories/inventory-movements-repository";
import { SheetsRepository } from "../repositories/sheets-repository";
import { InventoryMovement } from "@/domain/enterprise/entities/inventory-movement";
import { Injectable } from "@nestjs/common";

interface RegisterInventoryMovementUseCaseRequest {
  sheetId: string,
  type: 'ENTRY' | 'EXIT',
  quantity: number,
  description: string,
}

type RegisterInventoryMovementUseCaseResponse = Either<
  ResourceNotFoundError | InsufficientStockError,
  object
>

@Injectable()
export class RegisterInventoryMovementUseCase {
  constructor(
    private inventoryMovementRepository: InventoryMovementsRepository,
    private sheetsRepository: SheetsRepository
  ) { }

  async execute({
    sheetId, quantity, type, description
  }: RegisterInventoryMovementUseCaseRequest): Promise<RegisterInventoryMovementUseCaseResponse> {
    const sheet = await this.sheetsRepository.findById(sheetId)

    if (!sheet) return left(new ResourceNotFoundError())

    if (type === 'EXIT' && sheet.quantity < quantity) return left(new InsufficientStockError())

    if (type === 'ENTRY') {
      sheet.increaseStock(quantity)
    } else if (type === 'EXIT') {
      sheet.decreaseStock(quantity)
    }
    await this.sheetsRepository.save(sheet)

    const movement = InventoryMovement.create({
      sheetId: sheet.id,
      type,
      quantity,
      description
    })
    await this.inventoryMovementRepository.create(movement)

    return right({})
  }
}