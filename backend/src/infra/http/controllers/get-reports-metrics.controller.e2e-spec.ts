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

describe('Get Reports Metrics (E2E)', () => {
  let app: INestApplication
  let userFactory: UserFactory
  let materialFactory: MaterialFactory
  let sheetFactory: SheetFactory
  let clientFactory: ClientFactory
  let inventoryMovementFactory: InventoryMovementFactory
  let authToken: string

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

    authToken = (await userFactory.makeAuthenticatedUser()).accessToken
  })

  test('[GET] /metrics/reports', async () => {
    const material = await materialFactory.makePrismaMaterial({ name: 'Alumínio' })
    const client = await clientFactory.makePrismaClient({ name: 'Cliente Alumínio' })
    const standardSheet = await sheetFactory.makePrismaSheet({
      materialId: material.id,
      clientId: client.id,
      quantity: 8,
      price: 120,
      type: 'STANDARD',
    })
    const scrapSheet = await sheetFactory.makePrismaSheet({
      materialId: material.id,
      quantity: 3,
      price: 30,
      type: 'SCRAP',
    })

    await inventoryMovementFactory.makePrismaInventoryMovement({
      sheetId: standardSheet.id,
      type: 'EXIT',
      quantity: 2,
      description: 'Corte em chapa do cliente',
      createdAt: new Date(),
    })
    await inventoryMovementFactory.makePrismaInventoryMovement({
      sheetId: scrapSheet.id,
      type: 'ENTRY',
      quantity: 1,
      description: 'Retalho gerado do corte da chapa mãe: teste',
      createdAt: new Date(),
    })

    const response = await request(app.getHttpServer())
      .get('/metrics/reports?period=30d')
      .set('Authorization', `Bearer ${authToken}`)
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.body.metrics).toEqual(
      expect.objectContaining({
        selectedPeriod: expect.objectContaining({ key: '30d' }),
        overview: expect.objectContaining({
          totalStockValue: expect.any(Number),
          totalInventoryUnits: 11,
        }),
        topClients: expect.arrayContaining([
          expect.objectContaining({ name: 'Cliente Alumínio' }),
        ]),
      }),
    )
    expect(response.body.metrics.charts.operationalTrend).toEqual(expect.any(Array))
  })

  test('[GET] /metrics/reports with invalid period should fallback to 90d', async () => {
    const response = await request(app.getHttpServer())
      .get('/metrics/reports?period=invalid')
      .set('Authorization', `Bearer ${authToken}`)
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.body.metrics.selectedPeriod.key).toBe('90d')
  })
})