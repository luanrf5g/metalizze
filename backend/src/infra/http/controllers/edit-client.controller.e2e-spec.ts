import { AppModule } from "@/app.module"
import { DatabaseModule } from "@/infra/database/database.module"
import { PrismaService } from "@/infra/database/prisma/prisma.service"
import { INestApplication } from "@nestjs/common"
import { Test } from "@nestjs/testing"
import { ClientFactory } from "test/factories/make-client"
import { UserFactory } from "test/factories/make-user"
import request from 'supertest'

describe('Edit Client (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let clientFactory: ClientFactory
  let userFactory: UserFactory
  let authToken: string

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [ClientFactory, UserFactory]
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)
    clientFactory = moduleRef.get(ClientFactory)
    userFactory = moduleRef.get(UserFactory)

    await app.init()

    authToken = (await userFactory.makeAuthenticatedUser()).accessToken
  })

  test('[PUT] /clients/:id', async () => {
    const client = await clientFactory.makePrismaClient({
      document: '12345678900'
    })

    const clientId = client.id.toString()

    const response = await request(app.getHttpServer())
      .patch(`/clients/${clientId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        email: 'joao.silva@example.com',
      })

    expect(response.statusCode).toBe(204)

    const clientOnDatabase = await prisma.client.findUnique({
      where: {
        document: '12345678900'
      }
    })

    expect(clientOnDatabase).toBeTruthy()
    expect(clientOnDatabase?.email).toEqual('joao.silva@example.com')
  })
})