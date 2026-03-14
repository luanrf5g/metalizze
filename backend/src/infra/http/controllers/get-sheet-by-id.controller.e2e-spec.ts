import { AppModule } from '@/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { MaterialFactory } from 'test/factories/make-material'
import { SheetFactory } from 'test/factories/make-sheet'
import { UserFactory } from 'test/factories/make-user'

describe('Get Sheet By Id (E2E)', () => {
  let app: INestApplication
  let materialFactory: MaterialFactory
  let sheetFactory: SheetFactory
  let userFactory: UserFactory
  let authToken: string

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [SheetFactory, MaterialFactory, UserFactory]
    }).compile()

    app = moduleRef.createNestApplication()

    materialFactory = moduleRef.get(MaterialFactory)
    sheetFactory = moduleRef.get(SheetFactory)
    userFactory = moduleRef.get(UserFactory)

    await app.init()

    authToken = (await userFactory.makeAuthenticatedUser()).accessToken
  })

  test('[GET] /sheets/:id', async () => {
    const material = await materialFactory.makePrismaMaterial({ name: 'Carbono' })

    const sheet = await sheetFactory.makePrismaSheet({
      materialId: material.id
    })

    const response = await request(app.getHttpServer())
      .get(`/sheets/${sheet.id.toString()}`)
      .set('Authorization', `Bearer ${authToken}`)
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