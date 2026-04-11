import { UseCasesError } from "@/core/errors/use-cases-error";
import { QuoteStatus } from "@/domain/enterprise/entities/quote";

export class InvalidQuoteStatusTransitionError extends Error implements UseCasesError {
  constructor(from: QuoteStatus, to: QuoteStatus) {
    super(`Transição de status inválida: "${from}" -> "${to}".`)
  }
}
