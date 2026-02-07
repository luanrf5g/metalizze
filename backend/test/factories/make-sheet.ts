import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { Sheet, SheetProps } from "@/domain/enterprise/entities/sheet";
import { PrismaSheetMapper } from "@/infra/database/prisma/mappers/prisma-sheet-mapper";
import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { faker } from "@faker-js/faker";
import { Injectable } from "@nestjs/common";

export function makeSheet(
  override: Partial<SheetProps> = {},
  id?: UniqueEntityId
) {
  const sheet = Sheet.create(
    {
      materialId: new UniqueEntityId(),
      sku: faker.commerce.productName(),
      width: faker.number.int({ min: 1, max: 3000 }),
      height: faker.number.int({ min: 1, max: 1200 }),
      thickness: faker.number.int({ min: 1, max: 8 }),
      quantity: faker.number.int(10),
      ...override
    },
    id
  )

  return sheet
}

@Injectable()
export class SheetFactory {
  constructor(private prisma: PrismaService) { }

  async makePrismaSheet(data: Partial<SheetProps> = {}): Promise<Sheet> {
    const sheet = makeSheet(data)

    await this.prisma.sheet.create({
      data: PrismaSheetMapper.toPrisma(sheet)
    })

    return sheet
  }
}