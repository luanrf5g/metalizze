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

  it('should compute partial sheet units (9.35) and store materialCharged', async () => {
    const cuttingGas = await cuttingGasFactory.makePrismaCuttingGas({
      pricePerHour: 0,
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
        materialName: 'Aço Galvanizado',
        thickness: 1.5,
        sheetWidth: 2000,
        sheetHeight: 1000,
        baseMaterialPrice: 100,
        isFullMaterial: false,
        sheetCount: 10,
        hasPartialLastSheet: true,
        chargeFullLastSheet: false,
        partialSheetWidth: 700,
        partialSheetHeight: 1000,
        isMaterialProvidedByClient: false,
        cuttingGasId: cuttingGas.id.toString(),
        cuttingTimeMinutes: 0,
      })

    expect(addRes.statusCode).toBe(201)
    const item = addRes.body.quote.items[0]
    expect(item).toBeDefined()
    // partialUsage = (700*1000) / (2000*1000) = 0.35 → 9.35 units
    expect(item.computedSheetUnits).toBeCloseTo(9.35, 4)
    expect(item.materialCost).toBeCloseTo(935, 2)
    expect(item.materialCharged).toBeCloseTo(935, 2)
    // totalMaterial on the quote should reflect materialCharged
    expect(addRes.body.quote.totalMaterial).toBeCloseTo(935, 2)
  })

  it('should return 10 sheet units when chargeFullLastSheet=true', async () => {
    const cuttingGas = await cuttingGasFactory.makePrismaCuttingGas({ pricePerHour: 0 })
    const createRes = await request(app.getHttpServer())
      .post('/quotes')
      .set('Authorization', `Bearer ${authToken}`)
      .send({})
    const qId = createRes.body.quote.id

    const addRes = await request(app.getHttpServer())
      .post(`/quotes/${qId}/items`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        itemKind: 'SHEET',
        materialName: 'Inox',
        thickness: 2,
        sheetWidth: 2000,
        sheetHeight: 1000,
        baseMaterialPrice: 200,
        isFullMaterial: false,
        sheetCount: 10,
        hasPartialLastSheet: true,
        chargeFullLastSheet: true,
        cuttingGasId: cuttingGas.id.toString(),
        cuttingTimeMinutes: 0,
      })

    expect(addRes.statusCode).toBe(201)
    const item = addRes.body.quote.items[0]
    expect(item.computedSheetUnits).toBe(10)
    expect(item.materialCost).toBe(2000)
  })

  it('should set materialCharged=0 and reduce totalMaterial when isMaterialProvidedByClient=true', async () => {
    const cuttingGas = await cuttingGasFactory.makePrismaCuttingGas({ pricePerHour: 0 })
    const createRes = await request(app.getHttpServer())
      .post('/quotes')
      .set('Authorization', `Bearer ${authToken}`)
      .send({})
    const qId = createRes.body.quote.id

    const addRes = await request(app.getHttpServer())
      .post(`/quotes/${qId}/items`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        itemKind: 'SHEET',
        materialName: 'Alumínio cliente',
        thickness: 3,
        baseMaterialPrice: 800,
        isFullMaterial: true,
        isMaterialProvidedByClient: true,
        cuttingGasId: cuttingGas.id.toString(),
        cuttingTimeMinutes: 0,
      })

    expect(addRes.statusCode).toBe(201)
    const item = addRes.body.quote.items[0]
    expect(item.materialCost).toBe(800)
    expect(item.materialCharged).toBe(0)
    // totalMaterial on quote is computed from materialCharged
    expect(addRes.body.quote.totalMaterial).toBe(0)
    expect(addRes.body.quote.totalQuote).toBe(0)
  })

  it('GET /quotes list includes client and createdBy', async () => {
    const response = await request(app.getHttpServer())
      .get('/quotes')
      .set('Authorization', `Bearer ${authToken}`)

    expect(response.statusCode).toBe(200)
    const quotes: { client: unknown, createdBy: unknown }[] = response.body.quotes
    expect(Array.isArray(quotes)).toBe(true)
    if (quotes.length > 0) {
      const q = quotes[0]
      expect(q).toHaveProperty('createdBy')
      expect((q.createdBy as { name: string }).name).toBeDefined()
      // client may be null for quotes without a client
      expect('client' in q).toBe(true)
    }
  })

  it('should compute SIMPLE_CUT sheet units = cutArea/sheetArea', async () => {
    const cuttingGas = await cuttingGasFactory.makePrismaCuttingGas({ pricePerHour: 0 })
    const createRes = await request(app.getHttpServer())
      .post('/quotes')
      .set('Authorization', `Bearer ${authToken}`)
      .send({})
    const qId = createRes.body.quote.id

    const addRes = await request(app.getHttpServer())
      .post(`/quotes/${qId}/items`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        itemKind: 'SHEET',
        materialName: 'Aço SIMPLE_CUT',
        thickness: 3,
        sheetWidth: 2000,
        sheetHeight: 1000,
        baseMaterialPrice: 1000,
        isFullMaterial: false,
        materialCalcMode: 'SIMPLE_CUT',
        cutWidth: 400,
        cutHeight: 600,
        cuttingGasId: cuttingGas.id.toString(),
        cuttingTimeMinutes: 0,
      })

    expect(addRes.statusCode).toBe(201)
    const item = addRes.body.quote.items[0]
    // (400*600) / (2000*1000) = 0.12
    expect(item.computedSheetUnits).toBeCloseTo(0.12, 4)
    expect(item.materialCost).toBeCloseTo(120, 2)
    expect(item.materialCalcMode).toBe('SIMPLE_CUT')
  })

  it('should add a PROFILE item with NEST_UNITS and compute partial bar units', async () => {
    const cuttingGas = await cuttingGasFactory.makePrismaCuttingGas({ pricePerHour: 0 })
    const createRes = await request(app.getHttpServer())
      .post('/quotes')
      .set('Authorization', `Bearer ${authToken}`)
      .send({})
    const qId = createRes.body.quote.id

    const addRes = await request(app.getHttpServer())
      .post(`/quotes/${qId}/items`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        itemKind: 'PROFILE',
        materialName: 'Perfil U 30x30',
        thickness: 3,
        profileLength: 3000,
        baseMaterialPrice: 100,
        isFullMaterial: false,
        materialCalcMode: 'NEST_UNITS',
        profileBarCount: 5,
        hasPartialLastProfileBar: true,
        partialProfileLength: 600,
        chargeFullLastProfileBar: false,
        scrapNotes: 'Sobra para estoque',
        cuttingGasId: cuttingGas.id.toString(),
        cuttingTimeMinutes: 0,
      })

    expect(addRes.statusCode).toBe(201)
    const item = addRes.body.quote.items[0]
    // 4 + 600/3000 = 4.2
    expect(item.computedProfileBarUnits).toBeCloseTo(4.2, 4)
    expect(item.materialCost).toBeCloseTo(420, 2)
    expect(item.scrapNotes).toBe('Sobra para estoque')
    expect(item.materialCalcMode).toBe('NEST_UNITS')
  })

  it('should add a PROFILE item with SIMPLE_CUT and compute bar units = cutLength/profileLength', async () => {
    const cuttingGas = await cuttingGasFactory.makePrismaCuttingGas({ pricePerHour: 0 })
    const createRes = await request(app.getHttpServer())
      .post('/quotes')
      .set('Authorization', `Bearer ${authToken}`)
      .send({})
    const qId = createRes.body.quote.id

    const addRes = await request(app.getHttpServer())
      .post(`/quotes/${qId}/items`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        itemKind: 'PROFILE',
        materialName: 'Barra chata SIMPLE_CUT',
        thickness: 5,
        profileLength: 3000,
        baseMaterialPrice: 80,
        isFullMaterial: false,
        materialCalcMode: 'SIMPLE_CUT',
        cutLength: 750,
        cuttingGasId: cuttingGas.id.toString(),
        cuttingTimeMinutes: 0,
      })

    expect(addRes.statusCode).toBe(201)
    const item = addRes.body.quote.items[0]
    // 750/3000 = 0.25
    expect(item.computedProfileBarUnits).toBeCloseTo(0.25, 4)
    expect(item.materialCost).toBeCloseTo(20, 2)
    expect(item.materialCalcMode).toBe('SIMPLE_CUT')
  })

  it('should set materialCharged=0 for PROFILE when isMaterialProvidedByClient=true', async () => {
    const cuttingGas = await cuttingGasFactory.makePrismaCuttingGas({ pricePerHour: 0 })
    const createRes = await request(app.getHttpServer())
      .post('/quotes')
      .set('Authorization', `Bearer ${authToken}`)
      .send({})
    const qId = createRes.body.quote.id

    const addRes = await request(app.getHttpServer())
      .post(`/quotes/${qId}/items`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        itemKind: 'PROFILE',
        materialName: 'Tubo cliente',
        thickness: 3,
        profileLength: 6000,
        baseMaterialPrice: 200,
        isFullMaterial: false,
        materialCalcMode: 'NEST_UNITS',
        profileBarCount: 3,
        isMaterialProvidedByClient: true,
        cuttingGasId: cuttingGas.id.toString(),
        cuttingTimeMinutes: 0,
      })

    expect(addRes.statusCode).toBe(201)
    const item = addRes.body.quote.items[0]
    expect(item.materialCost).toBe(600) // 200 * 3
    expect(item.materialCharged).toBe(0)
    expect(addRes.body.quote.totalMaterial).toBe(0)
  })
})
