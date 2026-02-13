import { UseCasesError } from "@/core/errors/use-cases-error";

export class MaterialHasSheetsError extends Error implements UseCasesError {
  constructor() {
    super(`Cannot delete material that is linked to existing sheets.`)
  }
}