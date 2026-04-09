import { Either, left, right } from "@/core/logic/Either";
import { CuttingGasAlreadyExistsError } from "./errors/cutting-gas-already-exists-error";
import { CuttingGas } from "@/domain/enterprise/entities/cutting-gas";
import { Injectable } from "@nestjs/common";
import { CuttingGasRepository } from "../repositories/cutting-gas-repository";

interface RegisterCuttingGasUseCaseRequest {
  name: string,
  pricePerHour: number,
  isActive?: boolean
}

type RegisterCuttingGasUseCaseResponse = Either<
  CuttingGasAlreadyExistsError,
  {
    cuttingGas: CuttingGas
  }
>

@Injectable()
export class RegisterCuttingGasUseCase {
  constructor(
    private cuttingGasRepository: CuttingGasRepository
  ) { }

  async execute({
    name, pricePerHour, isActive = true
  }: RegisterCuttingGasUseCaseRequest): Promise<RegisterCuttingGasUseCaseResponse> {
    const normalizedName = this.normalizeName(name)

    const gasWithSameName = await this.cuttingGasRepository.findByName(
      normalizedName,
    )

    if (gasWithSameName) {
      return left(new CuttingGasAlreadyExistsError(normalizedName))
    }

    const cuttingGas = CuttingGas.create({
      name: normalizedName,
      pricePerHour,
      isActive
    })

    await this.cuttingGasRepository.create(cuttingGas)

    return right({
      cuttingGas
    })
  }

  private normalizeName(name: string): string {
    return name
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }
}

