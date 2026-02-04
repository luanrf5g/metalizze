import { UseCasesError } from "@/core/errors/use-cases-error";

export class MaterialAlreadyExistsError extends Error implements UseCasesError {
  constructor(identifier: string) {
    super(`Material "${identifier}" already exists`)
  }
}