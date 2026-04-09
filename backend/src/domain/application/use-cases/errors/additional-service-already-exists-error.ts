import { UseCasesError } from "@/core/errors/use-cases-error";

export class AdditionalServiceAlreadyExistsError extends Error implements UseCasesError {
  constructor(identifier: string) {
    super(`Additional service "${identifier}" already exists with same type.`)
  }
}
