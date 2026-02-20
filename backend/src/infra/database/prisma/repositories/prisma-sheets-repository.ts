import { FindManySheetsParams, SheetsRepository } from "@/domain/application/repositories/sheets-repository";
import { Sheet, SheetType } from "@/domain/enterprise/entities/sheet";
import { Injectable } from "@nestjs/common";
import { PrismaSheetMapper } from "../mappers/prisma-sheet-mapper";
import { PrismaService } from "../prisma.service";

@Injectable()
export class PrismaSheetsRepository implements SheetsRepository {
  constructor(private prisma: PrismaService) { }

  async create(sheet: Sheet) {
    const data = PrismaSheetMapper.toPrisma(sheet)

    await this.prisma.sheet.create({
      data
    })
  }

  async save(sheet: Sheet) {
    const data = PrismaSheetMapper.toPrisma(sheet)

    await this.prisma.sheet.update({
      where: {
        id: data.id
      },
      data
    })
  }

  async delete(id: string) {
    await this.prisma.sheet.delete({
      where: {
        id
      }
    })
  }

  async countByClientId(clientId: string) {
    const count = await this.prisma.sheet.count({
      where: {
        clientId
      }
    })

    return count
  }

  async countByMaterialId(materialId: string) {
    const count = await this.prisma.sheet.count({
      where: {
        materialId
      }
    })

    return count
  }

  async findById(id: string) {
    const sheet = await this.prisma.sheet.findUnique({
      where: {
        id
      }
    })

    if (!sheet) return null

    return PrismaSheetMapper.toDomain(sheet)
  }

  async findByDetails(
    materialId: string,
    width: number,
    height: number,
    thickness: number,
    clientId: string | null,
    type: SheetType
  ) {
    const sheet = await this.prisma.sheet.findFirst({
      where: {
        materialId,
        width,
        height,
        thickness,
        clientId,
        type
      }
    })

    if (!sheet) return null

    return PrismaSheetMapper.toDomain(sheet)
  }

  async findMany({ page, materialId, clientId, type }: FindManySheetsParams) {
    const sheets = await this.prisma.sheet.findMany({
      where: {
        materialId: materialId ?? undefined,
        clientId: clientId ?? undefined,
        type: type ?? undefined,
        deletedAt: null
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 15,
      skip: (page - 1) * 15,
      include: {
        material: true,
        client: true
      }
    })

    return sheets.map(PrismaSheetMapper.toDomain)
  }
}