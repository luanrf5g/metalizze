import { AppModule } from "@/app.module"
import { DatabaseModule } from "@/infra/database/database.module"
import { PrismaService } from "@/infra/database/prisma/prisma.service"
import { INestApplication } from "@nestjs/common"
import { Test } from "@nestjs/testing"
import { ClientFactory } from "test/factories/make-client"
import request from 'supertest'

describe('Edit Client (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let clientFactory: ClientFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [ClientFactory]
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)
    clientFactory = moduleRef.get(ClientFactory)

    await app.init()
  })

  test('[PUT] /clients/:id', async () => {
    const client = await clientFactory.makePrismaClient({
      document: '12345678900'
    })

    const clientId = client.id.toString()

    const response = await request(app.getHttpServer())
      .put(`/clients/${clientId}`)
      .send({
        name: 'João Silva',
        email: 'joao.silva@example.com',
        phone: '81999999999'
      })

    expect(response.statusCode).toBe(204)

    const clientOnDatabase = await prisma.client.findUnique({
      where: {
        document: '12345678900'
      }
    })

    expect(clientOnDatabase).toBeTruthy()
    expect(clientOnDatabase?.name).toEqual('João Silva')
    expect(clientOnDatabase?.phone).toEqual('81999999999')
    expect(clientOnDatabase?.email).toEqual('joao.silva@example.com')
  })
})