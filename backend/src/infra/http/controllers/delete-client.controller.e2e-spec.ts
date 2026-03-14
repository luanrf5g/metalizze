import { AppModule } from "@/app.module"
import { DatabaseModule } from "@/infra/database/database.module"
import { PrismaService } from "@/infra/database/prisma/prisma.service"
import { INestApplication } from "@nestjs/common"
import { Test } from "@nestjs/testing"
import { ClientFactory } from "test/factories/make-client"
import { MaterialFactory } from "test/factories/make-material"
import { SheetFactory } from "test/factories/make-sheet"
import { UserFactory } from "test/factories/make-user"
import request from 'supertest'

describe('Delete Client (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let clientFactory: ClientFactory
  let materialFactory: MaterialFactory
  let sheetFactory: SheetFactory
  let userFactory: UserFactory
  let authToken: string

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [MaterialFactory, SheetFactory, ClientFactory, UserFactory]
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)
    materialFactory = moduleRef.get(MaterialFactory)
    clientFactory = moduleRef.get(ClientFactory)
    sheetFactory = moduleRef.get(SheetFactory)
    userFactory = moduleRef.get(UserFactory)

    await app.init()

    authToken = (await userFactory.makeAuthenticatedUser()).accessToken
  })

  test('[DELETE] /clients/:id', async () => {
    const client = await clientFactory.makePrismaClient()

    const clientId = client.id.toString()

    const response = await request(app.getHttpServer())
      .delete(`/clients/${clientId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send()

    expect(response.statusCode).toBe(204)

    const clientOnDatabase = await prisma.client.findUnique({
      where: {
        id: clientId
      }
    })

    expect(clientOnDatabase).toBeNull()
  })

  test('[DELETE] /clients/:id (registered sheets)', async () => {
    const client = await clientFactory.makePrismaClient()

    const clientId = client.id.toString()

    const material = await materialFactory.makePrismaMaterial()
    await sheetFactory.makePrismaSheet({
      materialId: material.id,
      clientId: client.id
    })

    const response = await request(app.getHttpServer())
      .delete(`/clients/${clientId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send()

    expect(response.statusCode).toBe(409)
  })
})