import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { AppModule } from '@/app.module'
import { UserFactory } from 'test/factories/make-user'

describe('Create Material (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let userFactory: UserFactory
  let authToken: string

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      providers: [UserFactory],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    userFactory = moduleRef.get(UserFactory)

    await app.init()

    authToken = (await userFactory.makeAuthenticatedUser()).accessToken
  })

  test('[POST] /materials', async () => {
    const response = await request(app.getHttpServer())
      .post('/materials')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Aço Inox',
      })

    expect(response.statusCode).toBe(201)

    const materialOnDatabase = await prisma.material.findFirst()

    expect(materialOnDatabase).toBeTruthy()
    // Normalizamos a texto na criação para a primeira letra ser maiuscula
    // e o restante ser minúscula então o correto é Aço E2e 01
    expect(materialOnDatabase?.slug).toBe('aco-inox')
  })
})