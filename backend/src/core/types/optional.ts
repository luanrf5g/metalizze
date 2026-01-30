/**
 * Make some properties optional on type
 *
 * @example
 * ```typescript
 * type Post { id: string; name: string; email: string }
 * Optional<Post, 'id' | 'email'>
 * ```
 * Resultado: id e email viram opcionais, name continua obrigatório.
 */
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>