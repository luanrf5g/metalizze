import request from 'supertest'
import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { AppModule } from '@/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { UserFactory } from 'test/factories/make-user'

describe('Create Client (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let userFactory: UserFactory
  let authToken: string

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    userFactory = moduleRef.get(UserFactory)

    await app.init()

    authToken = (await userFactory.makeAuthenticatedUser()).accessToken
  })

  test('[POST] /clients', async () => {
    const response = await request(app.getHttpServer())
      .post('/clients')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'João Silva',
        document: '123.456.789-00',
        email: 'joao@gmail.com',
        phone: '11999999999'
      })

    expect(response.statusCode).toBe(201)

    const clientOnDatabase = await prisma.client.findUnique({
      where: {
        document: '123.456.789-00'
      }
    })

    expect(clientOnDatabase).toBeTruthy()
    expect(clientOnDatabase?.name).toBe('João Silva')
  })

  test('[POST] /clients (Conflict)', async () => {
    await request(app.getHttpServer())
      .post('/clients')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Maria Oliveira',
        document: '111.222.333-44'
      })

    const response = await request(app.getHttpServer())
      .post('/clients')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Maria Clonada',
        document: '123.456.789-00'
      })

    expect(response.statusCode).toBe(409)
  })
})