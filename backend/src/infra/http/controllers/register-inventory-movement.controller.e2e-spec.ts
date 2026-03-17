import { AppModule } from '@/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { MaterialFactory } from 'test/factories/make-material'
import { SheetFactory } from 'test/factories/make-sheet'
import { UserFactory } from 'test/factories/make-user'

describe('Register Inventory Movement (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let materialFactory: MaterialFactory
  let sheetFactory: SheetFactory
  let userFactory: UserFactory
  let authToken: string

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [MaterialFactory, SheetFactory, UserFactory],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    materialFactory = moduleRef.get(MaterialFactory)
    sheetFactory = moduleRef.get(SheetFactory)
    userFactory = moduleRef.get(UserFactory)

    await app.init()

    authToken = (await userFactory.makeAuthenticatedUser()).accessToken
  })

  test('[POST] /movements', async () => {
    const material = await materialFactory.makePrismaMaterial({ name: 'Aço SAE 1020' })
    const sheet = await sheetFactory.makePrismaSheet({
      materialId: material.id,
      quantity: 10,
      price: 100,
    })

    const response = await request(app.getHttpServer())
      .post('/movements')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        sheetId: sheet.id.toString(),
        type: 'EXIT',
        quantity: 3,
        description: 'Saída manual E2E',
      })

    expect(response.statusCode).toBe(201)

    const sheetOnDatabase = await prisma.sheet.findUnique({
      where: { id: sheet.id.toString() },
    })
    const movementOnDatabase = await prisma.inventoryMovement.findFirst({
      where: {
        sheetId: sheet.id.toString(),
        description: 'Saída manual E2E',
      },
    })

    expect(sheetOnDatabase?.quantity).toBe(7)
    expect(movementOnDatabase).toBeTruthy()
  })
})