import { AppModule } from "@/app.module"
import { DatabaseModule } from "@/infra/database/database.module"
import { INestApplication } from "@nestjs/common"
import { Test } from "@nestjs/testing"
import request from "supertest"
import { ClientFactory } from "test/factories/make-client"

describe('Get Client By Document (E2E)', () => {
  let app: INestApplication
  let clientFactory: ClientFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [ClientFactory]
    }).compile()

    app = moduleRef.createNestApplication()

    clientFactory = moduleRef.get(ClientFactory)

    await app.init()
  })

  test('[GET] /clients/:document', async () => {
    const client = await clientFactory.makePrismaClient({ document: '12345678900' })

    const response = await request(app.getHttpServer())
      .get(`/clients/${client.document}`)
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