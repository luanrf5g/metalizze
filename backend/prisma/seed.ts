import 'dotenv/config'
import { PrismaClient, UserRole } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { hash } from 'bcryptjs'

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('Seeding database...')

    const adminPasswordHash = await hash('admin123', 8)

    const admin = await prisma.user.upsert({
        where: { email: 'admin@metalizze.com' },
        update: {
            password: adminPasswordHash,
            role: UserRole.ADMIN,
            permissions: {},
        },
        create: {
            name: 'Administrador',
            email: 'admin@metalizze.com',
            password: adminPasswordHash,
            role: UserRole.ADMIN,
            permissions: {},
            isActive: true,
        },
    })

    console.log('Admin user created/updated:', admin.email)

    console.log('Only admin user seeded.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
