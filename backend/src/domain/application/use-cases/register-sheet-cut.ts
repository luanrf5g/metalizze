import { ResourceNotFoundError } from "@/core/errors/errors/resource-not-found-error"
import { Either, left, right } from "@/core/logic/Either"
import { InsufficientStockError } from "./errors/insufficient-stock-error"
import { Injectable } from "@nestjs/common"
import { SheetsRepository } from "../repositories/sheets-repository"
import { InventoryMovementsRepository } from "../repositories/inventory-movements-repository"
import { MaterialsRepository } from "../repositories/materials-repository"
import { ClientsRepository } from "../repositories/clients-repository"
import { InventoryMovement } from "@/domain/enterprise/entities/inventory-movement"
import { UniqueEntityId } from "@/core/entities/unique-entity-id"
import { SkuGenerator } from "../services/sku-generator"
import { Sheet } from "@/domain/enterprise/entities/sheet"

interface ScrapInput {
  width: number,
  height: number,
  quantity: number,
  clientId?: string | null
}

interface RegisterSheetCutUseCaseRequest {
  sheetId: string,
  quantityToCut: number,
  generatedScraps: ScrapInput[],
  description?: string
}

type RegisterSheetCutUseCaseResponse = Either<
  ResourceNotFoundError | InsufficientStockError,
  null
>

@Injectable()
export class RegisterSheetCutUseCase {
  constructor(
    private sheetsRepository: SheetsRepository,
    private inventoryMovementsRepository: InventoryMovementsRepository,
    private materialsRepository: MaterialsRepository,
    private clientsRepository: ClientsRepository
  ) { }

  async execute({
    sheetId,
    quantityToCut,
    generatedScraps,
    description
  }: RegisterSheetCutUseCaseRequest): Promise<RegisterSheetCutUseCaseResponse> {
    const motherSheet = await this.sheetsRepository.findById(sheetId)

    if (!motherSheet) return left(new ResourceNotFoundError())

    if (motherSheet.quantity < quantityToCut) return left(new InsufficientStockError())

    const material = await this.materialsRepository.findById(motherSheet.materialId.toString())
    if (!material) return left(new ResourceNotFoundError())

    motherSheet.decreaseStock(quantityToCut)
    await this.sheetsRepository.save(motherSheet)

    const outMovement = InventoryMovement.create({
      sheetId: motherSheet.id,
      type: 'EXIT',
      quantity: quantityToCut,
      description: description ?? `Corte de chapa. Gerou ${generatedScraps.length} lote(s) de retalho(s).`
    })
    await this.inventoryMovementsRepository.create(outMovement)

    for (const scrap of generatedScraps) {
      const existingScrap = await this.sheetsRepository.findByDetails(
        motherSheet.materialId.toString(),
        scrap.width,
        scrap.height,
        motherSheet.thickness,
        scrap.clientId ?? null,
        'SCRAP'
      )

      let scrapSheetId: UniqueEntityId

      if (existingScrap) {
        existingScrap.increaseStock(scrap.quantity)
        await this.sheetsRepository.save(existingScrap)
        scrapSheetId = existingScrap.id
      } else {
        let clientName = null
        if (scrap.clientId) {
          const client = await this.clientsRepository.findById(scrap.clientId)
          if (client) clientName = client.name
        }

        const sku = SkuGenerator.generate({
          materialSlug: material.slug.value,
          width: scrap.width,
          height: scrap.height,
          thickness: motherSheet.thickness,
          type: 'SCRAP',
          clientName
        })

        const newScrapSheet = Sheet.create({
          materialId: motherSheet.materialId,
          clientId: scrap.clientId ? new UniqueEntityId(scrap.clientId) : null,
          sku,
          width: scrap.width,
          height: scrap.height,
          thickness: motherSheet.thickness,
          quantity: scrap.quantity,
          type: 'SCRAP'
        })

        await this.sheetsRepository.create(newScrapSheet)
        scrapSheetId = newScrapSheet.id
      }

      const entryMovement = InventoryMovement.create({
        sheetId: scrapSheetId,
        type: 'ENTRY',
        quantity: scrap.quantity,
        description: `Retalho gerado do corte da chapa mãe: ${motherSheet.sku}`
      })
      await this.inventoryMovementsRepository.create(entryMovement)
    }

    return right(null)
  }
}