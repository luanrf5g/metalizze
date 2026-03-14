import { AppModule } from "@/app.module"
import { DatabaseModule } from "@/infra/database/database.module"
import { INestApplication } from "@nestjs/common"
import { Test } from "@nestjs/testing"
import { ClientFactory } from "test/factories/make-client"
import { UserFactory } from "test/factories/make-user"
import request from "supertest"

describe('Fetch Clients (E2E)', () => {
  let app: INestApplication
  let clientFactory: ClientFactory
  let userFactory: UserFactory
  let authToken: string

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [ClientFactory, UserFactory]
    }).compile()

    app = moduleRef.createNestApplication()

    clientFactory = moduleRef.get(ClientFactory)
    userFactory = moduleRef.get(UserFactory)

    await app.init()

    authToken = (await userFactory.makeAuthenticatedUser()).accessToken
  })

  test('[GET] /clients', async () => {
    await Promise.all([
      clientFactory.makePrismaClient({
        name: 'John Doe'
      }),
      clientFactory.makePrismaClient({
        name: 'Joana Doe'
      })
    ])

    const response = await request(app.getHttpServer())
      .get('/clients')
      .set('Authorization', `Bearer ${authToken}`)
      .send()


    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      clients: expect.arrayContaining([
        expect.objectContaining({ name: 'John Doe' }),
        expect.objectContaining({ name: 'Joana Doe' })
      ])
    })
  })
})