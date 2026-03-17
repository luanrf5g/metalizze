import { AppModule } from '@/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { ClientFactory } from 'test/factories/make-client'
import { InventoryMovementFactory } from 'test/factories/make-inventory-movement'
import { MaterialFactory } from 'test/factories/make-material'
import { SheetFactory } from 'test/factories/make-sheet'
import { UserFactory } from 'test/factories/make-user'

describe('Get Dashboard Metrics (E2E)', () => {
  let app: INestApplication
  let userFactory: UserFactory
  let materialFactory: MaterialFactory
  let sheetFactory: SheetFactory
  let clientFactory: ClientFactory
  let inventoryMovementFactory: InventoryMovementFactory
  let adminToken: string
  let operatorToken: string

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory, MaterialFactory, SheetFactory, ClientFactory, InventoryMovementFactory],
    }).compile()

    app = moduleRef.createNestApplication()
    userFactory = moduleRef.get(UserFactory)
    materialFactory = moduleRef.get(MaterialFactory)
    sheetFactory = moduleRef.get(SheetFactory)
    clientFactory = moduleRef.get(ClientFactory)
    inventoryMovementFactory = moduleRef.get(InventoryMovementFactory)

    await app.init()

    adminToken = (await userFactory.makeAuthenticatedUser({ role: 'ADMIN' })).accessToken
    operatorToken = (await userFactory.makeAuthenticatedUser({ role: 'OPERATOR' })).accessToken
  })

  test('[GET] /metrics/cards', async () => {
    const material = await materialFactory.makePrismaMaterial({ name: 'Aço Inox' })
    const client = await clientFactory.makePrismaClient({ name: 'Cliente Premium' })
    const standardSheet = await sheetFactory.makePrismaSheet({
      materialId: material.id,
      clientId: client.id,
      quantity: 10,
      price: 150,
      type: 'STANDARD',
    })
    await sheetFactory.makePrismaSheet({
      materialId: material.id,
      quantity: 4,
      price: 50,
      type: 'SCRAP',
    })

    await inventoryMovementFactory.makePrismaInventoryMovement({
      sheetId: standardSheet.id,
      type: 'EXIT',
      quantity: 2,
      description: 'Ordem semanal de corte',
      createdAt: new Date(),
    })

    const adminResponse = await request(app.getHttpServer())
      .get('/metrics/cards')
      .set('Authorization', `Bearer ${adminToken}`)
      .send()

    expect(adminResponse.statusCode).toBe(200)
    expect(adminResponse.body.metrics).toEqual(
      expect.objectContaining({
        role: 'ADMIN',
        summary: expect.objectContaining({
          totalInventoryUnits: 14,
          totalStockValue: expect.any(Number),
        }),
        clientsWithOwnedSheetOrders: expect.arrayContaining([
          expect.objectContaining({ name: 'Cliente Premium' }),
        ]),
      }),
    )

    const operatorResponse = await request(app.getHttpServer())
      .get('/metrics/cards')
      .set('Authorization', `Bearer ${operatorToken}`)
      .send()

    expect(operatorResponse.statusCode).toBe(200)
    expect(operatorResponse.body.metrics.summary.totalStockValue).toBeNull()
  })
})