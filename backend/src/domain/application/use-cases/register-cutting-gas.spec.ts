import { InMemoryCuttingGasRepository } from "test/repositories/in-memory-cutting-gas-repository"
import { RegisterCuttingGasUseCase } from "./register-cutting-gas"
import { CuttingGasAlreadyExistsError } from "./errors/cutting-gas-already-exists-error"

let cuttingGasRepository: InMemoryCuttingGasRepository
let sut: RegisterCuttingGasUseCase

describe('Register Cutting Gas Use Case', () => {
  beforeEach(() => {
    cuttingGasRepository = new InMemoryCuttingGasRepository()
    sut = new RegisterCuttingGasUseCase(cuttingGasRepository)
  })

  it('should be able to register a new cutting gas', async () => {
    const result = await sut.execute({
      name: 'Oxigênio',
      pricePerHour: 500
    })

    expect(result.isRight()).toBe(true)
    expect(cuttingGasRepository.items[0].name).toEqual('Oxigênio')
    expect(cuttingGasRepository.items[0].pricePerHour).toEqual(500)
  })

  it('should not be able to register a cutting gas with same name', async () => {
    const gasName = 'Argônio'
    await sut.execute({
      name: gasName,
      pricePerHour: 300
    })

    const result = await sut.execute({
      name: gasName,
      pricePerHour: 300
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(CuttingGasAlreadyExistsError)
  })
})