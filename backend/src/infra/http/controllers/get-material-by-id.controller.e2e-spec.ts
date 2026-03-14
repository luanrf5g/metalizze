import { AppModule } from '@/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { MaterialFactory } from 'test/factories/make-material'
import { UserFactory } from 'test/factories/make-user'

describe('Get Material By Id (E2E)', () => {
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

  test('[GET] /materials/:id', async () => {
    const material = await materialFactory.makePrismaMaterial({ name: 'Aço Inox' })

    const response = await request(app.getHttpServer())
      .get(`/materials/${material.id.toString()}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.body).toMatchObject({
      material: {
        name: 'Aço Inox',
        slug: 'aco-inox'
      }
    })
  })
})