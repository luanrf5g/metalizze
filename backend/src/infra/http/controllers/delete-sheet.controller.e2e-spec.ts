import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { AppModule } from '@/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { SheetFactory } from 'test/factories/make-sheet'
import { MaterialFactory } from 'test/factories/make-material'

describe('Delete Sheet (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let materialFactory: MaterialFactory
  let sheetFactory: SheetFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [MaterialFactory, SheetFactory],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    materialFactory = moduleRef.get(MaterialFactory)
    sheetFactory = moduleRef.get(SheetFactory)

    await app.init()
  })

  test('[DELETE] /sheets/:id', async () => {
    const material = await materialFactory.makePrismaMaterial()
    const sheet = await sheetFactory.makePrismaSheet({
      materialId: material.id,
    })

    let sheetOnDatabase = await prisma.sheet.findUnique({
      where: { id: sheet.id.toString() },
    })
    expect(sheetOnDatabase?.deletedAt).toBeNull()

    const response = await request(app.getHttpServer())
      .delete(`/sheets/${sheet.id.toString()}`)
      .send()

    expect(response.statusCode).toBe(204)

    sheetOnDatabase = await prisma.sheet.findUnique({
      where: { id: sheet.id.toString() },
    })

    expect(sheetOnDatabase).toBeTruthy()
    expect(sheetOnDatabase?.deletedAt).toEqual(expect.any(Date))
  })
})