import { AppModule } from "@/app.module"
import { DatabaseModule } from "@/infra/database/database.module"
import { PrismaService } from "@/infra/database/prisma/prisma.service"
import { INestApplication } from "@nestjs/common"
import { Test } from "@nestjs/testing"
import request from "supertest"

describe('Get Client By Document (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule]
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)

    await app.init()
  })

  test('[GET] /clients/:document', async () => {
    const client = await prisma.client.create({
      data: {
        name: 'John Doe',
        document: '12345678901',
        email: 'johndoe@example.com',
        phone: '12345678901',
      }
    })

    const response = await request(app.getHttpServer())
      .get(`/clients/${client.document}`)
      .expect(200)

    expect(response.body).toMatchObject({
      props: expect.objectContaining({
        name: client.name,
        document: client.document,
        email: client.email,
        phone: client.phone
      })
    })
  })
})