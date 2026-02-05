import { ResourceNotFoundError } from "@/core/errors/errors/resource-not-found-error"
import { Either, left, right } from "@/core/logic/Either"
import { Sheet } from "@/domain/enterprise/entities/sheet"
import { SheetsRepository } from "../repositories/sheets-repository"
import { MaterialsRepository } from "../repositories/materials-repository"
import { UniqueEntityId } from "@/core/entities/unique-entity-id"
import { Injectable } from "@nestjs/common"
import { ClientsRepository } from "../repositories/clients-repository"

interface RegisterSheetUseCaseRequest {
  materialId: string,
  clientId?: string | null,
  width: number,
  height: number,
  thickness: number,
  quantity: number,
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
    private clientsRepository: ClientsRepository
  ) { }

  async execute({
    materialId,
    width,
    height,
    thickness,
    quantity,
    clientId = null
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
      clientId
    )

    if (existingSheet) {
      existingSheet.increaseStock(quantity)

      await this.sheetsRepository.save(existingSheet)

      return right({
        sheet: existingSheet
      })
    }

    const formatOwnerName = (name: string) => {
      return name
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
    }

    const formattedThickness = thickness.toFixed(2)
    const baseSku = `${material.slug.value}-${formattedThickness}-${width}x${height}`.toUpperCase()

    const sku = clientName
      ? `${baseSku}-C:${formatOwnerName(clientName)}`
      : baseSku

    const sheet = Sheet.create({
      materialId: new UniqueEntityId(materialId),
      clientId: clientId ? new UniqueEntityId(clientId) : null,
      width,
      height,
      thickness,
      quantity,
      sku
    })

    await this.sheetsRepository.create(sheet)

    return right({
      sheet
    })
  }
}