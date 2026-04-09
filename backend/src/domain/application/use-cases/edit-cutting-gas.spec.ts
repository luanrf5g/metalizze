import { InMemoryCuttingGasRepository } from "test/repositories/in-memory-cutting-gas-repository";
import { EditCuttingGasUseCase } from "./edit-cutting-gas";
import { makeCuttingGas } from "test/factories/make-cutting-gas";

let cuttingGasRepository: InMemoryCuttingGasRepository
let sut: EditCuttingGasUseCase

describe('Edit Cutting Gas Use Case', () => {
  beforeEach(() => {
    cuttingGasRepository = new InMemoryCuttingGasRepository()
    sut = new EditCuttingGasUseCase(cuttingGasRepository)
  })

  it('should be able to edit a cutting gas', async () => {
    const cuttingGas = makeCuttingGas({
      name: 'Oxigênio',
      pricePerHour: 500
    })

    await cuttingGasRepository.create(cuttingGas)

    const result = await sut.execute({
      gasId: cuttingGas.id.toString(),
      name: 'Ar Comprimido',
      pricePerHour: 600,
      isActive: false
    })

    expect(result.isRight()).toBe(true)
    expect(cuttingGasRepository.items[0]).toMatchObject({
      props: {
        name: 'Ar Comprimido',
        pricePerHour: 600,
        isActive: false
      }
    })
  })

  it('should not be able to edit a non existing cutting gas', async () => {
    const result = await sut.execute({
      gasId: 'non-existing-id',
      name: 'Ar Comprimido',
      pricePerHour: 600,
      isActive: false
    })

    expect(result.isLeft()).toBe(true)
  })

  it('should not be able to edit a cutting gas with a name that already exists', async () => {
    const cuttingGas1 = makeCuttingGas({
      name: 'Oxigênio'
    })

    const cuttingGas2 = makeCuttingGas({
      name: 'Ar Comprimido'
    })

    await cuttingGasRepository.create(cuttingGas1)
    await cuttingGasRepository.create(cuttingGas2)

    const result = await sut.execute({
      gasId: cuttingGas2.id.toString(),
      name: 'Oxigênio',
      pricePerHour: 600,
      isActive: false
    })

    expect(result.isLeft()).toBe(true)
  })
})