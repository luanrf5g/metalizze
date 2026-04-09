import { InMemoryCuttingGasRepository } from "test/repositories/in-memory-cutting-gas-repository";
import { GetCuttingGasByIdUseCase } from "./get-cutting-gas-by-id";
import { makeCuttingGas } from "test/factories/make-cutting-gas";
import { UniqueEntityId } from "@/core/entities/unique-entity-id";

let cuttingGasRepository: InMemoryCuttingGasRepository
let sut: GetCuttingGasByIdUseCase

describe('Get Cutting Gas By Id Use Case', () => {
  beforeEach(() => {
    cuttingGasRepository = new InMemoryCuttingGasRepository()
    sut = new GetCuttingGasByIdUseCase(cuttingGasRepository)
  })

  it('should be able to get a cutting gas by id', async () => {
    const cuttingGas = makeCuttingGas({}, new UniqueEntityId('gas-1'))

    await cuttingGasRepository.create(cuttingGas)

    const result = await sut.execute({ gasId: 'gas-1' })

    expect(result.isRight()).toBeTruthy()
    expect(result.value).toEqual({ cuttingGas })
  })
})