import { config } from 'dotenv'
import { randomUUID } from 'node:crypto'
import { execSync } from 'node:child_process'
import { Pool } from 'pg'

config({ path: '.env', override: true })
config({ path: '.env.test', override: true })

function generateDatabaseUrlForDatabase(dbName: string) {
  if (!process.env.DATABASE_URL) {
    throw new Error('Please provide a DATABASE_URL environment variable.')
  }
  const url = new URL(process.env.DATABASE_URL)
  // Replace the pathname (database name) with our test DB name
  url.pathname = `/${dbName}`
  // Remove any schema query param if present
  url.searchParams.delete('schema')
  return url.toString()
}

const uniqueId = randomUUID()
const testDbName = `prisma_test_${uniqueId}`

// Always use DB-per-test: create a fresh test database and run migrations there.
process.env.DATABASE_URL = generateDatabaseUrlForDatabase(testDbName)

beforeAll(async () => {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required')

  const originalUrl = new URL(process.env.DATABASE_URL)
  const adminDbName = 'postgres'
  originalUrl.pathname = `/${adminDbName}`
  originalUrl.search = ''
  const adminConnectionString = originalUrl.toString()

  const adminPool = new Pool({ connectionString: adminConnectionString })

  try {
    await adminPool.query(`CREATE DATABASE "${testDbName}"`)

    // Point env to the newly created DB and run migrations there
    process.env.DATABASE_URL = generateDatabaseUrlForDatabase(testDbName)
    execSync('npx prisma migrate deploy')

    console.log(`🧪 [setup-e2e] created test database: ${testDbName}`)
  } catch (err: any) {
    console.error(
      'Failed to create test database. Ensure the DATABASE_URL user has CREATE DATABASE permission and that the server allows creating databases.',
      String(err),
    )
    throw err
  } finally {
    await adminPool.end()
  }
})

afterAll(async () => {
  if (!process.env.DATABASE_URL) return

  const adminUrl = new URL(process.env.DATABASE_URL)
  adminUrl.pathname = '/postgres'
  adminUrl.search = ''
  const adminConnectionString = adminUrl.toString()

  const adminPool = new Pool({ connectionString: adminConnectionString })
  try {
    // Terminate open connections to the test DB to allow dropping it
    await adminPool.query(
      `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()`,
      [testDbName],
    )
    await adminPool.query(`DROP DATABASE IF EXISTS "${testDbName}"`)
    console.log(`🧪 [setup-e2e] dropped test database: ${testDbName}`)
  } finally {
    await adminPool.end()
  }
})