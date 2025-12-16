import { PrismaClient, UserRole } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const databaseUrl = process.env.DATABASE_URL;
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined');
}

if (!adminEmail) {
  throw new Error('ADMIN_EMAIL is not defined');
}

if (!adminPassword) {
  throw new Error('ADMIN_PASSWORD is not defined');
}

// TypeScript type narrowing after validation
const validatedAdminEmail: string = adminEmail;
const validatedAdminPassword: string = adminPassword;

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const pool = new Pool({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

async function main() {
  const existingAdmin = await prisma.user.findFirst({
    where: {
      email: validatedAdminEmail,
      role: UserRole.admin,
      deletedAt: null,
    },
  });

  if (existingAdmin) {
    console.log('✅ Admin already exists. Skipping seed.');
    return;
  }

  const passwordHash = await bcrypt.hash(validatedAdminPassword, 10);

  await prisma.user.create({
    data: {
      email: validatedAdminEmail,
      passwordHash,
      role: UserRole.admin,
      isActive: true,
      firstName: 'Super',
      lastName: 'Admin',
    },
  });

  console.log('🚀 Initial admin created');
  console.log(`📧 Email: ${validatedAdminEmail}`);
  console.log(`🔑 Password: ${validatedAdminPassword}`);
}

main()
  .catch((err) => {
    console.error('❌ Seed failed', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await pool.end();
  });
