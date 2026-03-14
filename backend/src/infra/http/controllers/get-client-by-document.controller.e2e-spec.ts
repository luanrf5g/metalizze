import { AppModule } from "@/app.module"
import { DatabaseModule } from "@/infra/database/database.module"
import { INestApplication } from "@nestjs/common"
import { Test } from "@nestjs/testing"
import request from "supertest"
import { ClientFactory } from "test/factories/make-client"
import { UserFactory } from "test/factories/make-user"

describe('Get Client By Document (E2E)', () => {
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

  test('[GET] /clients/:document', async () => {
    const client = await clientFactory.makePrismaClient({ document: '12345678900' })

    const response = await request(app.getHttpServer())
      .get(`/clients/${client.document}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)

    expect(response.body).toMatchObject({
      client: expect.objectContaining({
        name: client.name,
        document: client.document,
        email: client.email,
        phone: client.phone
      })
    })
  })
})