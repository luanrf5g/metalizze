import { UseCasesError } from '@/core/errors/use-cases-error'

export class ResourceNotFoundError extends Error implements UseCasesError {
    constructor() {
        super('Recurso não encontrado.')
    }
}
