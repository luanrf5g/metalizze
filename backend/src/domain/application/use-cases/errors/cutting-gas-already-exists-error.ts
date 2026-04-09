import { UseCasesError } from "@/core/errors/use-cases-error";

export class CuttingGasAlreadyExistsError extends Error implements UseCasesError {
  constructor(identifier: string) {
    super(`Cutting gas "${identifier}" already exists.`)
  }
}