import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const buildConnectionString = () => {
  const base = process.env.POSTGRES_URL_PRISMA || process.env.POSTGRES_URL;
  if (!base) {
    throw new Error('POSTGRES_URL is required for Prisma');
  }

  // Ensure a schema is set to avoid clashing with existing public objects
  const schema = process.env.PRISMA_DB_SCHEMA || 'nkv_admin';
  const hasSchemaParam = base.includes('schema=');
  if (hasSchemaParam || process.env.POSTGRES_URL_PRISMA) {
    return { connectionString: base, schema };
  }
  const separator = base.includes('?') ? '&' : '?';
  return { connectionString: `${base}${separator}schema=${schema}`, schema };
};

const { connectionString, schema } = buildConnectionString();

const pool = new Pool({
  connectionString,
  options: `-c search_path=${schema}`,
});

const adapter = new PrismaPg(pool, { schema });

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
