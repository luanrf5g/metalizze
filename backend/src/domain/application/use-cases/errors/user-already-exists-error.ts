import { UseCasesError } from '@/core/errors/use-cases-error'

export class UserAlreadyExistsError extends Error implements UseCasesError {
    constructor(identifier: string) {
        super(`Usuário "${identifier}" já existe.`)
    }
}
