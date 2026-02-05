import { AppModule } from "@/app.module"
import { DatabaseModule } from "@/infra/database/database.module"
import { PrismaService } from "@/infra/database/prisma/prisma.service"
import { INestApplication } from "@nestjs/common"
import { Test } from "@nestjs/testing"
import { MaterialFactory } from "test/factories/make-material"
import request from 'supertest'

describe('Create Sheet (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let materialFactory: MaterialFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [MaterialFactory]
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    materialFactory = moduleRef.get(MaterialFactory)

    await app.init()
  })

  test('[POST] /sheets', async () => {
    const material = await materialFactory.makePrismaMaterial({
      name: 'Aço Carbono'
    })

    const materialId = material.id.toString()

    const sheetToInsert = {
      materialId,
      width: 2000,
      height: 1000,
      thickness: 2,
      quantity: 10,
      owner: null
    }

    const response = await request(app.getHttpServer())
      .post('/sheets')
      .send(sheetToInsert)

    expect(response.statusCode).toBe(201)

    const sheetOnDatabase = await prisma.sheet.findFirst({
      where: {
        sku: 'ACO-CARBONO-2.00-2000X1000'
      }
    })

    expect(sheetOnDatabase).toBeTruthy()
    expect(sheetOnDatabase?.quantity).toBe(10)

    await request(app.getHttpServer())
      .post('/sheets')
      .send({
        ...sheetToInsert,
        quantity: 5,
      })

    const sheetUpdated = await prisma.sheet.findFirst({
      where: {
        sku: 'ACO-CARBONO-2.00-2000X1000'
      }
    })

    expect(sheetUpdated?.quantity).toBe(15)
  })
})