import { UseCasesError } from "@/core/errors/use-cases-error";

export class InvalidDiscountError extends Error implements UseCasesError {
  constructor(message?: string) {
    super(message ?? 'Desconto inválido.')
  }
}
