import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { Sheet } from "@/domain/enterprise/entities/sheet";
import { Prisma, Sheet as PrismaSheet } from "@prisma/client";

export class PrismaSheetMapper {
  static toDomain(raw: PrismaSheet): Sheet {
    return Sheet.create(
      {
        materialId: new UniqueEntityId(raw.materialId),
        clientId: raw.clientId ? new UniqueEntityId(raw.clientId) : null,
        sku: raw.sku,
        width: raw.width,
        height: raw.height,
        thickness: raw.thickness,
        quantity: raw.quantity,
        type: raw.type,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        deletedAt: raw.deletedAt,
      },
      new UniqueEntityId(raw.id)
    )
  }

  static toPrisma(sheet: Sheet): Prisma.SheetUncheckedCreateInput {
    return {
      id: sheet.id.toString(),
      materialId: sheet.materialId.toString(),
      clientId: sheet.clientId?.toString() ?? null,
      sku: sheet.sku,
      width: sheet.width,
      height: sheet.height,
      thickness: sheet.thickness,
      quantity: sheet.quantity,
      type: sheet.type,
      createdAt: sheet.createdAt,
      updatedAt: sheet.updatedAt,
      deletedAt: sheet.deletedAt
    }
  }
}