import { AppModule } from "@/app.module"
import { DatabaseModule } from "@/infra/database/database.module"
import { PrismaService } from "@/infra/database/prisma/prisma.service"
import { INestApplication } from "@nestjs/common"
import { Test } from "@nestjs/testing"
import { MaterialFactory } from "test/factories/make-material"
import { SheetFactory } from "test/factories/make-sheet"
import request from 'supertest'

describe('Reduce Sheet Stock (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let materialFactory: MaterialFactory
  let sheetFactory: SheetFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [MaterialFactory, SheetFactory]
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)
    materialFactory = moduleRef.get(MaterialFactory)
    sheetFactory = moduleRef.get(SheetFactory)

    await app.init()
  })

  test('[POST] /sheets/:id/reduce-stock', async () => {
    const material = await materialFactory.makePrismaMaterial({ name: 'Aço Teste' })

    const sheet = await sheetFactory.makePrismaSheet({
      materialId: material.id,
      quantity: 10
    })

    const sheetId = sheet.id.toString()

    const response = await request(app.getHttpServer())
      .post(`/sheets/${sheetId}/reduce-stock`)
      .send({
        quantity: 3,
        description: 'Corte do pedido #999',
      })

    expect(response.statusCode).toBe(204)

    const sheetOnDatabase = await prisma.sheet.findUnique({
      where: {
        id: sheetId
      }
    })

    expect(sheetOnDatabase?.quantity).toBe(7)

    const movementOnDatabase = await prisma.inventoryMovement.findFirst({
      where: {
        sheetId: sheetId,
        type: 'EXIT'
      }
    })

    expect(movementOnDatabase).toBeDefined()
    expect(movementOnDatabase?.quantity).toBe(3)
    expect(movementOnDatabase?.description).toBe('Corte do pedido #999')
  })

  test('[POST] /sheets/:id/reduce-stock (Insufficient Stock)', async () => {
    const material = await materialFactory.makePrismaMaterial()
    const sheet = await sheetFactory.makePrismaSheet({
      materialId: material.id,
      quantity: 2
    })

    const sheetId = sheet.id.toString()

    const response = await request(app.getHttpServer())
      .post(`/sheets/${sheetId}/reduce-stock`)
      .send({
        quantity: 5,
      })

    expect(response.statusCode).toBe(400)
  })
})