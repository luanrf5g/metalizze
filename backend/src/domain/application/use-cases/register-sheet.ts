import { ResourceNotFoundError } from "@/core/errors/errors/resource-not-found-error"
import { Either, left, right } from "@/core/logic/Either"
import { Sheet } from "@/domain/enterprise/entities/sheet"
import { SheetsRepository } from "../repositories/sheets-repository"
import { MaterialsRepository } from "../repositories/materials-repository"
import { UniqueEntityId } from "@/core/entities/unique-entity-id"
import { Injectable } from "@nestjs/common"

interface RegisterSheetUseCaseRequest {
  materialId: string,
  width: number,
  height: number,
  thickness: number,
  quantity: number,
  owner?: string | null
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
    private materialsRepository: MaterialsRepository
  ) { }

  async execute({
    materialId,
    width,
    height,
    thickness,
    quantity,
    owner = null
  }: RegisterSheetUseCaseRequest): Promise<RegisterSheetUseCaseResponse> {
    const material = await this.materialsRepository.findById(materialId)

    if (!material) {
      return left(new ResourceNotFoundError())
    }

    const existingSheet = await this.sheetsRepository.findByDetails(
      materialId,
      width,
      height,
      thickness,
      owner
    )

    if (existingSheet) {
      existingSheet.increaseStock(quantity)

      await this.sheetsRepository.save(existingSheet)

      return right({
        sheet: existingSheet
      })
    }

    const formattedThickness = thickness.toFixed(2)
    const baseSku = `${material.slug.value}-${formattedThickness}-${width}x${height}`.toUpperCase()
    const formatOwnerName = (name: string) => {
      return name
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
    }

    const sku = owner
      ? `${baseSku}-C:${formatOwnerName(owner)}`
      : baseSku

    const sheet = Sheet.create({
      materialId: new UniqueEntityId(materialId),
      width,
      height,
      thickness,
      quantity,
      owner,
      sku
    })

    await this.sheetsRepository.create(sheet)

    return right({
      sheet
    })
  }
}