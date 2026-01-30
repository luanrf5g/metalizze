import { UseCaseError } from "@/core/errors/use-case-error";

export class MaterialAlreadyExistsError extends Error implements UseCaseError {
  constructor(identifier: string) {
    super(`Material "${identifier}" already exists`)
  }
}