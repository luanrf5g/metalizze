import { AppModule } from '@/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { MaterialFactory } from 'test/factories/make-material'
import { SheetFactory } from 'test/factories/make-sheet'
import { UserFactory } from 'test/factories/make-user'

describe('Delete Material (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let materialFactory: MaterialFactory
  let sheetFactory: SheetFactory
  let userFactory: UserFactory
  let authToken: string

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [MaterialFactory, SheetFactory, UserFactory]
    }).compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)
    materialFactory = moduleRef.get(MaterialFactory)
    sheetFactory = moduleRef.get(SheetFactory)
    userFactory = moduleRef.get(UserFactory)

    await app.init()

    authToken = (await userFactory.makeAuthenticatedUser()).accessToken
  })

  test('[DELETE] /materials/:id', async () => {
    const material = await materialFactory.makePrismaMaterial({ name: 'Aço Carbono' })

    const materialId = material.id.toString()

    const response = await request(app.getHttpServer())
      .delete(`/materials/${materialId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send()

    expect(response.statusCode).toBe(204)

    const materialOnDatabase = await prisma.material.findUnique({
      where: {
        id: materialId
      }
    })

    expect(materialOnDatabase).toBeNull()
  })

  test('[DELETE] /materials/:id (Sheet linked)', async () => {
    const material = await materialFactory.makePrismaMaterial({ name: 'Aço Carbono' })
    await sheetFactory.makePrismaSheet({ materialId: material.id })

    const materialId = material.id.toString()

    const response = await request(app.getHttpServer())
      .delete(`/materials/${materialId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send()

    expect(response.statusCode).toBe(409)

    const materialOnDatabase = await prisma.material.findUnique({
      where: {
        id: materialId
      }
    })

    expect(materialOnDatabase).toBeTruthy()
  })
})