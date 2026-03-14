import z from "zod";

export const envSchema = z.object({
  DATABASE_URL: z.url(),
  PORT: z.coerce.number().optional().default(3000),
  JWT_PUBLIC_KEY: z.string(),
  JWT_PRIVATE_KEY: z.string(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

export type Env = z.infer<typeof envSchema>