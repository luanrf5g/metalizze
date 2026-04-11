import request from 'supertest'
import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '@/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { UserFactory } from 'test/factories/make-user'
import { CuttingGasFactory } from 'test/factories/make-cutting-gas'

describe('Quotes (E2E)', () => {
  let app: INestApplication
  let userFactory: UserFactory
  let cuttingGasFactory: CuttingGasFactory
  let authToken: string

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory, CuttingGasFactory],
    }).compile()

    app = moduleRef.createNestApplication()
    userFactory = moduleRef.get(UserFactory)
    cuttingGasFactory = moduleRef.get(CuttingGasFactory)

    await app.init()

    authToken = (await userFactory.makeAuthenticatedUser()).accessToken
  })

  afterAll(async () => {
    await app.close()
  })

  it('full quote lifecycle', async () => {
    const cuttingGas = await cuttingGasFactory.makePrismaCuttingGas({
      name: 'Argônio',
      pricePerHour: 120,
    })

    // 1) Create quote
    const createRes = await request(app.getHttpServer())
      .post('/quotes')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ notes: 'Teste ciclo completo' })

    expect(createRes.statusCode).toBe(201)
    const quoteId: string = createRes.body.quote.id
    expect(quoteId).toBeTruthy()
    expect(createRes.body.quote.status).toBe('DRAFT')

    // 2) Update quote (change discount and notes)
    const updateRes = await request(app.getHttpServer())
      .patch(`/quotes/${quoteId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        notes: 'Notas atualizadas',
        discountType: 'PERCENT',
        discountValue: 10,
      })

    expect(updateRes.statusCode).toBe(200)
    expect(updateRes.body.quote.notes).toBe('Notas atualizadas')
    expect(updateRes.body.quote.discountType).toBe('PERCENT')
    expect(updateRes.body.quote.discountValue).toBe(10)
    expect(updateRes.body.quote.items).toBeDefined()

    // 3) Add item with a service
    const addItemRes = await request(app.getHttpServer())
      .post(`/quotes/${quoteId}/items`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        itemKind: 'SHEET',
        materialName: 'Aço Carbono',
        thickness: 3,
        sheetWidth: 1000,
        sheetHeight: 2000,
        baseMaterialPrice: 200,
        isManualPrice: true,
        cuttingGasId: cuttingGas.id.toString(),
        cuttingTimeMinutes: 30,
        cutWidth: 500,
        cutHeight: 500,
        discountType: null,
        discountValue: null,
        services: [],
      })

    expect(addItemRes.statusCode).toBe(201)
    expect(addItemRes.body.quote.id).toBe(quoteId)
    expect(addItemRes.body.quote.items).toHaveLength(1)

    const itemId: string = addItemRes.body.quote.items[0].id
    expect(itemId).toBeTruthy()
    expect(addItemRes.body.quote.totalMaterial).toBeGreaterThan(0)

    // 4) GET /quotes/:id -> quote with items and services
    const getRes = await request(app.getHttpServer())
      .get(`/quotes/${quoteId}`)
      .set('Authorization', `Bearer ${authToken}`)

    expect(getRes.statusCode).toBe(200)
    expect(getRes.body.quote.id).toBe(quoteId)
    expect(getRes.body.quote.items).toHaveLength(1)
    expect(getRes.body.quote.items[0].id).toBe(itemId)

    // 5) Transition to SENT -> sentAt should be set
    const sentRes = await request(app.getHttpServer())
      .patch(`/quotes/${quoteId}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'SENT' })

    expect(sentRes.statusCode).toBe(200)
    expect(sentRes.body.quote.status).toBe('SENT')
    expect(sentRes.body.quote.sentAt).toBeTruthy()

    // 6) PATCH /quotes/:id should fail with 409 when status is SENT
    const updateWhileSentRes = await request(app.getHttpServer())
      .patch(`/quotes/${quoteId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ notes: 'Tentativa inválida' })

    expect(updateWhileSentRes.statusCode).toBe(409)

    // 7) Transition back to DRAFT -> revision should be incremented
    const backToDraftRes = await request(app.getHttpServer())
      .patch(`/quotes/${quoteId}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'DRAFT' })

    expect(backToDraftRes.statusCode).toBe(200)
    expect(backToDraftRes.body.quote.status).toBe('DRAFT')
    expect(backToDraftRes.body.quote.revision).toBe(2)
  })

  it('should return 404 for non-existent quote', async () => {
    const response = await request(app.getHttpServer())
      .get('/quotes/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${authToken}`)

    expect(response.statusCode).toBe(404)
  })

  it('should list quotes', async () => {
    const response = await request(app.getHttpServer())
      .get('/quotes')
      .set('Authorization', `Bearer ${authToken}`)

    expect(response.statusCode).toBe(200)
    expect(response.body).toHaveProperty('quotes')
    expect(Array.isArray(response.body.quotes)).toBe(true)
  })

  it('should return 400 when creating quote with invalid body', async () => {
    const response = await request(app.getHttpServer())
      .post('/quotes')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        discountType: 'INVALID_TYPE',
      })

    expect(response.statusCode).toBe(400)
  })

  it('should transition status -> APPROVED and block further transitions', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/quotes')
      .set('Authorization', `Bearer ${authToken}`)
      .send({})

    expect(createRes.statusCode).toBe(201)
    const qId: string = createRes.body.quote.id

    // DRAFT -> APPROVED (allowed per transition table)
    const approvedRes = await request(app.getHttpServer())
      .patch(`/quotes/${qId}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'APPROVED' })

    expect(approvedRes.statusCode).toBe(200)
    expect(approvedRes.body.quote.status).toBe('APPROVED')
    expect(approvedRes.body.quote.approvedAt).toBeTruthy()

    // APPROVED -> SENT should fail: invalid transition
    const invalidRes = await request(app.getHttpServer())
      .patch(`/quotes/${qId}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'SENT' })

    expect(invalidRes.statusCode).toBe(409)
  })

  it('should delete a quote item', async () => {
    const cuttingGas = await cuttingGasFactory.makePrismaCuttingGas({
      pricePerHour: 60,
    })

    const createRes = await request(app.getHttpServer())
      .post('/quotes')
      .set('Authorization', `Bearer ${authToken}`)
      .send({})
    expect(createRes.statusCode).toBe(201)
    const qId: string = createRes.body.quote.id

    const addRes = await request(app.getHttpServer())
      .post(`/quotes/${qId}/items`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        itemKind: 'SHEET',
        materialName: 'Alumínio',
        thickness: 2,
        baseMaterialPrice: 150,
        cuttingGasId: cuttingGas.id.toString(),
        cuttingTimeMinutes: 20,
      })
    expect(addRes.statusCode).toBe(201)
    const iId: string = addRes.body.quote.items[0].id

    const deleteRes = await request(app.getHttpServer())
      .delete(`/quotes/${qId}/items/${iId}`)
      .set('Authorization', `Bearer ${authToken}`)

    expect(deleteRes.statusCode).toBe(200)
    expect(deleteRes.body.quote.items).toHaveLength(0)
  })
})
