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
    // 1. Preparação
    const material = await materialFactory.makePrismaMaterial()
    const sheet = await sheetFactory.makePrismaSheet({
      materialId: material.id,
    })

    // Verifica se a chapa realmente está ativa (deletedAt == null)
    let sheetOnDatabase = await prisma.sheet.findUnique({
      where: { id: sheet.id.toString() },
    })
    expect(sheetOnDatabase?.deletedAt).toBeNull()

    // 2. Ação
    const response = await request(app.getHttpServer())
      .delete(`/sheets/${sheet.id.toString()}`)
      .send()

    // 3. Verificação
    expect(response.statusCode).toBe(204)

    sheetOnDatabase = await prisma.sheet.findUnique({
      where: { id: sheet.id.toString() },
    })

    // A chapa ainda deve existir no banco, MAS com o deletedAt preenchido (Soft Delete)
    expect(sheetOnDatabase).toBeTruthy()
    expect(sheetOnDatabase?.deletedAt).toEqual(expect.any(Date))
  })
})