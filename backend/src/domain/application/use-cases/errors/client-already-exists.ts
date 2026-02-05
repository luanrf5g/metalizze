import { UseCasesError } from "@/core/errors/use-cases-error";

export class ClientAlreadyExistsError extends Error implements UseCasesError {
  constructor(identifier: string) {
    super(`Client "${identifier}" already exists.`)
  }
}