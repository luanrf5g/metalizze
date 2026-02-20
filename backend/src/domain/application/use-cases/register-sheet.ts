import { ResourceNotFoundError } from "@/core/errors/errors/resource-not-found-error"
import { Either, left, right } from "@/core/logic/Either"
import { Sheet } from "@/domain/enterprise/entities/sheet"
import { SheetsRepository } from "../repositories/sheets-repository"
import { MaterialsRepository } from "../repositories/materials-repository"
import { UniqueEntityId } from "@/core/entities/unique-entity-id"
import { Injectable } from "@nestjs/common"
import { ClientsRepository } from "../repositories/clients-repository"
import { InventoryMovementsRepository } from "../repositories/inventoryMovementsRepository"
import { InventoryMovement } from "@/domain/enterprise/entities/inventory-movement"
import { SkuGenerator } from "../services/sku-generator"

interface RegisterSheetUseCaseRequest {
  materialId: string,
  clientId?: string | null,
  width: number,
  height: number,
  thickness: number,
  quantity: number,
  type?: 'STANDARD' | 'SCRAP'
}

type RegisterSheetUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    sheet: Sheet
  }
>

@Injectable()
export class RegisterSheetUseCase {
  constructor(
    private sheetsRepository: SheetsRepository,
    private materialsRepository: MaterialsRepository,
    private clientsRepository: ClientsRepository,
    private inventoryMovementsRepository: InventoryMovementsRepository
  ) { }

  async execute({
    materialId,
    width,
    height,
    thickness,
    quantity,
    clientId = null,
    type = 'STANDARD',
  }: RegisterSheetUseCaseRequest): Promise<RegisterSheetUseCaseResponse> {
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

    const existingSheet = await this.sheetsRepository.findByDetails(
      materialId,
      width,
      height,
      thickness,
      clientId,
      type
    )

    if (existingSheet) {
      existingSheet.increaseStock(quantity)
      await this.sheetsRepository.save(existingSheet)

      const movement = InventoryMovement.create({
        sheetId: existingSheet.id,
        type: 'ENTRY',
        quantity,
        description: 'Entrada de Estoque (Adição de Chapa).'
      })
      await this.inventoryMovementsRepository.create(movement)

      return right({
        sheet: existingSheet
      })
    }

    const finalSku = SkuGenerator.generate({
      materialSlug: material.slug.value,
      width,
      height,
      thickness,
      type,
      clientName
    })

    const sheet = Sheet.create({
      materialId: new UniqueEntityId(materialId),
      clientId: clientId ? new UniqueEntityId(clientId) : null,
      width,
      height,
      thickness,
      quantity,
      type,
      sku: finalSku
    })
    await this.sheetsRepository.create(sheet)

    const movement = InventoryMovement.create({
      sheetId: sheet.id,
      type: 'ENTRY',
      quantity,
      description: 'Entrada de Estoque (Nova Chapa).'
    })
    await this.inventoryMovementsRepository.create(movement)

    return right({
      sheet
    })
  }
}