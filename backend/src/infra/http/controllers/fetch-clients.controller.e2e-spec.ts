import { AppModule } from "@/app.module"
import { DatabaseModule } from "@/infra/database/database.module"
import { INestApplication } from "@nestjs/common"
import { Test } from "@nestjs/testing"
import { ClientFactory } from "test/factories/make-client"
import request from "supertest"

describe('Fetch Clients (E2E)', () => {
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