import { AppModule } from '@/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { InventoryMovementFactory } from 'test/factories/make-inventory-movement'
import { MaterialFactory } from 'test/factories/make-material'
import { SheetFactory } from 'test/factories/make-sheet'

describe('Fetch Inventory Movements (E2E)', () => {
  let app: INestApplication
  let materialFactory: MaterialFactory
  let sheetFactory: SheetFactory
  let movementFactory: InventoryMovementFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [MaterialFactory, SheetFactory, InventoryMovementFactory]
    }).compile()

    app = moduleRef.createNestApplication()

    materialFactory = moduleRef.get(MaterialFactory)
    sheetFactory = moduleRef.get(SheetFactory)
    movementFactory = moduleRef.get(InventoryMovementFactory)

    await app.init()
  })

  test('[GET] /movements', async () => {
    const material = await materialFactory.makePrismaMaterial()
    const sheet = await sheetFactory.makePrismaSheet({ materialId: material.id })

    await movementFactory.makePrismaInventoryMovement({ sheetId: sheet.id, type: 'ENTRY', quantity: 10 })
    await movementFactory.makePrismaInventoryMovement({ sheetId: sheet.id, type: 'EXIT', quantity: 2 })

    const response = await request(app.getHttpServer())
      .get('/movements')
      .query({ sheetId: sheet.id.toString() })
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.body.movements).toHaveLength(2)
    expect(response.body.movements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'ENTRY', quantity: 10 }),
        expect.objectContaining({ type: 'EXIT', quantity: 2 }),
      ])
    )
  })
})