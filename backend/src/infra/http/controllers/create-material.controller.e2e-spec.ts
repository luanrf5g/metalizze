import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { AppModule } from '@/app.module'
import { DatabaseModule } from '@/infra/database/database.module'

describe('Create Material (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)

    await app.init()
  })

  test('[POST] /materials', async () => {
    const response = await request(app.getHttpServer())
      .post('/materials')
      .send({
        name: 'Aço E2E 01',
      })

    expect(response.statusCode).toBe(201)

    const materialOnDatabase = await prisma.material.findFirst()

    expect(materialOnDatabase).toBeTruthy()
    // Normalizamos a texto na criação para a primeira letra ser maiuscula
    // e o restante ser minúscula então o correto é Aço E2e 01
    expect(materialOnDatabase?.name).toBe('Aço E2e 01')
  })
})