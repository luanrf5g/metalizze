import { UseCasesError } from "@/core/errors/use-cases-error";

export class ClientHasSheetsError extends Error implements UseCasesError {
  constructor(identifier: string) {
    super(`Cannot delete client "${identifier}". Client has sheets registered in inventory.`)
  }
}