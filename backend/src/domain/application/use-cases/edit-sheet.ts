import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { Sheet, SheetType } from "@/domain/enterprise/entities/sheet";
import { Injectable } from "@nestjs/common";
import { SheetsRepository } from "../repositories/sheets-repository";
import { Either, left, right } from "@/core/logic/Either";
import { ResourceNotFoundError } from "@/core/errors/errors/resource-not-found-error";
import { MaterialsRepository } from "../repositories/materials-repository";
import { ClientsRepository } from "../repositories/clients-repository";
import { SkuGenerator } from "../services/sku-generator";

interface EditSheetUseCaseRequest {
  sheetId: string,
  materialId?: string,
  clientId?: string | null,
  width?: number,
  height?: number,
  thickness?: number,
  type?: SheetType
}

type EditSheetUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    sheet: Sheet
  }
>

@Injectable()
export class EditSheetUseCase {
  constructor(
    private sheetsRepository: SheetsRepository,
    private materialsRepository: MaterialsRepository,
    private clientsRepository: ClientsRepository
  ) { }

  async execute({
    sheetId, materialId, clientId, width, height, thickness, type
  }: EditSheetUseCaseRequest): Promise<EditSheetUseCaseResponse> {
    const sheet = await this.sheetsRepository.findById(sheetId)

    if (!sheet) {
      return left(new ResourceNotFoundError())
    }

    if (type) sheet.type = type

    if (clientId !== undefined) {
      sheet.clientId = clientId ? new UniqueEntityId(clientId) : null
    }

    const hasDimensionsChanged = width || height || thickness
    const hasMaterialChanged = materialId && materialId !== sheet.materialId.toString()
    const hasClientChanged = clientId !== undefined
    const hasTypeChanged = type && type !== sheet.type

    if (width) sheet.width = width
    if (height) sheet.height = height
    if (thickness) sheet.thickness = thickness
    if (materialId) sheet.materialId = new UniqueEntityId(materialId)

    if (hasDimensionsChanged || hasMaterialChanged || hasClientChanged || hasTypeChanged) {
      const currentMaterialId = materialId ?? sheet.materialId.toString()
      const material = await this.materialsRepository.findById(currentMaterialId)

      if (!material) return left(new ResourceNotFoundError())

      let clientName = null
      if (sheet.clientId) {
        const client = await this.clientsRepository.findById(sheet.clientId.toString())
        if (!client) return left(new ResourceNotFoundError())
        if (client) clientName = client.name
      }

      const newSku = SkuGenerator.generate({
        materialSlug: material.slug.value,
        width: sheet.width,
        height: sheet.height,
        thickness: sheet.thickness,
        type: sheet.type,
        clientName: clientName
      })

      sheet.sku = newSku
    }

    await this.sheetsRepository.save(sheet)

    return right({ sheet })
  }
}