import { AppModule } from '@/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { MaterialFactory } from 'test/factories/make-material'
import { SheetFactory } from 'test/factories/make-sheet'

describe('Get Sheet By Id (E2E)', () => {
  let app: INestApplication
  let materialFactory: MaterialFactory
  let sheetFactory: SheetFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [SheetFactory, MaterialFactory]
    }).compile()

    app = moduleRef.createNestApplication()

    materialFactory = moduleRef.get(MaterialFactory)
    sheetFactory = moduleRef.get(SheetFactory)

    await app.init()
  })

  test('[GET] /sheets/:id', async () => {
    const material = await materialFactory.makePrismaMaterial({ name: 'Carbono' })

    const sheet = await sheetFactory.makePrismaSheet({
      materialId: material.id
    })

    const response = await request(app.getHttpServer())
      .get(`/sheets/${sheet.id.toString()}`)
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.body).toMatchObject({
      sheet: {
        id: sheet.id.toString(),
        sku: sheet.sku
      }
    })
  })
})