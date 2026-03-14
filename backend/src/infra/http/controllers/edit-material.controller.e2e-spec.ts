import { AppModule } from '@/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { MaterialFactory } from 'test/factories/make-material'
import { UserFactory } from 'test/factories/make-user'

describe('Edit Material (E2E)', () => {
  let app: INestApplication
  let materialFactory: MaterialFactory
  let userFactory: UserFactory
  let authToken: string

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [MaterialFactory, UserFactory]
    }).compile()

    app = moduleRef.createNestApplication()

    materialFactory = moduleRef.get(MaterialFactory)
    userFactory = moduleRef.get(UserFactory)

    await app.init()

    authToken = (await userFactory.makeAuthenticatedUser()).accessToken
  })

  test('[PATCH] /materials/:id', async () => {
    const material = await materialFactory.makePrismaMaterial({ name: 'Aço Inox' })

    const materialId = material.id.toString()

    const response = await request(app.getHttpServer())
      .patch(`/materials/${materialId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Aço Carbono'
      })

    expect(response.statusCode).toBe(204)
  })
})