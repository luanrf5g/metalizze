import { AppModule } from '@/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { InventoryMovementFactory } from 'test/factories/make-inventory-movement'
import { MaterialFactory } from 'test/factories/make-material'
import { SheetFactory } from 'test/factories/make-sheet'
import { UserFactory } from 'test/factories/make-user'

describe('Get Inventory Movements Metrics (E2E)', () => {
  let app: INestApplication
  let userFactory: UserFactory
  let materialFactory: MaterialFactory
  let sheetFactory: SheetFactory
  let inventoryMovementFactory: InventoryMovementFactory
  let authToken: string

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory, MaterialFactory, SheetFactory, InventoryMovementFactory],
    }).compile()

    app = moduleRef.createNestApplication()
    userFactory = moduleRef.get(UserFactory)
    materialFactory = moduleRef.get(MaterialFactory)
    sheetFactory = moduleRef.get(SheetFactory)
    inventoryMovementFactory = moduleRef.get(InventoryMovementFactory)

    await app.init()

    authToken = (await userFactory.makeAuthenticatedUser()).accessToken
  })

  test('[GET] /metrics/inventory-movements', async () => {
    const material = await materialFactory.makePrismaMaterial({ name: 'Galvanizado' })
    const sheet = await sheetFactory.makePrismaSheet({ materialId: material.id, quantity: 10 })
    const createdAt = new Date('2026-03-10T12:00:00.000Z')

    await inventoryMovementFactory.makePrismaInventoryMovement({
      sheetId: sheet.id,
      type: 'ENTRY',
      quantity: 5,
      createdAt,
    })
    await inventoryMovementFactory.makePrismaInventoryMovement({
      sheetId: sheet.id,
      type: 'EXIT',
      quantity: 2,
      createdAt,
    })

    const response = await request(app.getHttpServer())
      .get('/metrics/inventory-movements')
      .set('Authorization', `Bearer ${authToken}`)
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      metrics: expect.arrayContaining([
        expect.objectContaining({
          date: '2026-03-10',
          entries: 5,
          exits: 2,
        }),
      ]),
    })
  })
})