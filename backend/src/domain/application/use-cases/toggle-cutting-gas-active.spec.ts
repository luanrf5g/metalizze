import { InMemoryCuttingGasRepository } from "test/repositories/in-memory-cutting-gas-repository";
import { ToggleCuttingGasActiveUseCase } from "./toggle-cutting-gas-active";
import { makeCuttingGas } from "test/factories/make-cutting-gas";

let cuttingGasRepository: InMemoryCuttingGasRepository
let sut: ToggleCuttingGasActiveUseCase

describe('Toggle Cutting Gas Active Use Case', () => {
  beforeEach(() => {
    cuttingGasRepository = new InMemoryCuttingGasRepository()
    sut = new ToggleCuttingGasActiveUseCase(cuttingGasRepository)
  })

  it('should be able to toggle cutting gas active', async () => {
    const cuttingGas = makeCuttingGas({
      name: 'Argônio',
      isActive: true
    })

    await cuttingGasRepository.create(cuttingGas)

    expect(cuttingGas.isActive).toBe(true)

    const result = await sut.execute({
      gasId: cuttingGas.id.toString()
    })

    expect(result.isRight()).toBeTruthy()
    expect(cuttingGasRepository.items[0].isActive).toBe(false)
  })
})