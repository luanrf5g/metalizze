import { ResourceNotFoundError } from "@/core/errors/errors/resource-not-found-error";
import { Either, left, right } from "@/core/logic/Either";
import { InsufficientStockError } from "./errors/insufficient-stock-error";
import { Sheet } from "@/domain/enterprise/entities/sheet";
import { SheetsRepository } from "../repositories/sheets-repository";
import { InventoryMovementsRepository } from "../repositories/inventoryMovementsRepository";
import { InventoryMovement } from "@/domain/enterprise/entities/inventory-movement";
import { Injectable } from "@nestjs/common";

interface ReduceSheetStockUseCaseRequest {
  sheetId: string,
  quantity: number,
  description?: string
}

type ReduceSheetStockUseCaseResponse = Either<
  ResourceNotFoundError | InsufficientStockError,
  {
    sheet: Sheet
  }
>

@Injectable()
export class ReduceSheetStockUseCase {
  constructor(
    private sheetsRepository: SheetsRepository,
    private inventoryMovementsRepository: InventoryMovementsRepository
  ) { }

  async execute({
    sheetId,
    quantity,
    description
  }: ReduceSheetStockUseCaseRequest): Promise<ReduceSheetStockUseCaseResponse> {
    const sheet = await this.sheetsRepository.findById(sheetId)

    if (!sheet) {
      return left(new ResourceNotFoundError())
    }

    if (sheet.quantity < quantity) {
      return left(new InsufficientStockError)
    }

    sheet.decreaseStock(quantity)
    await this.sheetsRepository.save(sheet)

    const movement = InventoryMovement.create({
      sheetId: sheet.id,
      quantity: quantity,
      type: 'EXIT',
      description
    })

    await this.inventoryMovementsRepository.create(movement)

    return right({
      sheet,
    })
  }
}