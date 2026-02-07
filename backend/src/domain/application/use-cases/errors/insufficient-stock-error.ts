import { UseCasesError } from "@/core/errors/use-cases-error";

export class InsufficientStockError extends Error implements UseCasesError {
  constructor() {
    super('Insufficient stock quantity for this operation.')
  }
}