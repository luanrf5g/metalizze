import { UseCasesError } from "@/core/errors/use-cases-error";

export class QuoteCodeCollisionError extends Error implements UseCasesError {
  constructor() {
    super('Não foi possível gerar um código único para o orçamento após várias tentativas.')
  }
}
