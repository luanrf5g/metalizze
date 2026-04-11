import { UseCasesError } from "@/core/errors/use-cases-error";
import { QuoteStatus } from "@/domain/enterprise/entities/quote";

export class QuoteNotEditableError extends Error implements UseCasesError {
  constructor(status: QuoteStatus) {
    super(`O orçamento não pode ser editado pois está com status "${status}".`)
  }
}
