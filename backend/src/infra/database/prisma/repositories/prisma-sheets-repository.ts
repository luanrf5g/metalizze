import { FindManySheetsParams, SheetsRepository } from "@/domain/application/repositories/sheets-repository";
import { Sheet, SheetType } from "@/domain/enterprise/entities/sheet";
import { Injectable } from "@nestjs/common";
import { PrismaSheetMapper } from "../mappers/prisma-sheet-mapper";
import { PrismaService } from "../prisma.service";
import { PrismaSheetWithDetailsMapper } from "../mappers/prisma-sheet-with-details-mapper";

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

  async findMany({ page, perPage, materialId, clientId, type, search, materials, thicknesses, sortBy, sortOrder }: FindManySheetsParams) {
    const pageSize = Math.min(perPage ?? 20, 100)
    const where = this.buildWhereClause({ materialId, clientId, type, search, materials, thicknesses })
    const orderBy = this.buildOrderBy(sortBy, sortOrder)

    const sheets = await this.prisma.sheet.findMany({
      where,
      orderBy,
      take: pageSize,
      skip: (page - 1) * pageSize,
      include: {
        material: true,
        client: true
      }
    })

    return sheets.map(PrismaSheetWithDetailsMapper.toDomain)
  }

  async findAll({ materialId, clientId, type }: Omit<FindManySheetsParams, 'page'>) {
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
      include: {
        material: true,
        client: true
      }
    })

    return sheets.map(PrismaSheetWithDetailsMapper.toDomain)
  }

  async count({ materialId, clientId, type, search, materials, thicknesses }: Omit<FindManySheetsParams, 'page'>) {
    const where = this.buildWhereClause({ materialId, clientId, type, search, materials, thicknesses })

    const total = await this.prisma.sheet.count({ where })

    return total
  }

  private buildWhereClause({
    materialId,
    clientId,
    type,
    search,
    materials,
    thicknesses,
  }: Omit<FindManySheetsParams, 'page' | 'perPage' | 'sortBy' | 'sortOrder'>) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const andClauses: any[] = [{ deletedAt: null }]

    if (materialId) andClauses.push({ materialId })
    if (clientId) andClauses.push({ clientId })
    if (type) andClauses.push({ type })

    if (materials && materials.length > 0) {
      andClauses.push({
        material: {
          name: { in: materials, mode: 'insensitive' }
        }
      })
    }

    if (thicknesses && thicknesses.length > 0) {
      andClauses.push({ thickness: { in: thicknesses } })
    }

    if (search && search.trim().length > 0) {
      const tokens = search.trim().split(/\s+/).filter(Boolean)

      for (const token of tokens) {
        const normalizedToken = token.replace(',', '.')
        const isNumeric = /^[\d.,]+$/.test(normalizedToken) && !isNaN(parseFloat(normalizedToken))

        if (isNumeric) {
          const num = parseFloat(normalizedToken)
          andClauses.push({
            OR: [
              { thickness: num },
              { width: num },
              { height: num },
            ]
          })
        } else {
          // Check if token looks like "NUMxNUM" or "NUM×NUM"
          const dimMatch = normalizedToken.match(/^(\d+(?:\.\d+)?)[x×](\d+(?:\.\d+)?)$/)
          if (dimMatch) {
            const w = parseFloat(dimMatch[1])
            const h = parseFloat(dimMatch[2])
            andClauses.push({
              OR: [
                { AND: [{ width: w }, { height: h }] },
                { AND: [{ width: h }, { height: w }] },
              ]
            })
          } else {
            andClauses.push({
              OR: [
                { sku: { contains: token, mode: 'insensitive' } },
                { material: { name: { contains: token, mode: 'insensitive' } } },
                { client: { name: { contains: token, mode: 'insensitive' } } },
                { client: { document: { contains: token, mode: 'insensitive' } } },
              ]
            })
          }
        }
      }
    }

    return { AND: andClauses }
  }

  private buildOrderBy(
    sortBy?: 'createdAt' | 'updatedAt' | 'quantity' | 'thickness' | null,
    sortOrder?: 'asc' | 'desc' | null,
  ) {
    const direction = sortOrder === 'asc' ? 'asc' : 'desc'
    const field = sortBy ?? 'updatedAt'
    return { [field]: direction }
  }
}