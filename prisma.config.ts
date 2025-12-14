import 'dotenv/config';
import { defineConfig } from '@prisma/config';

const appendSchemaParam = (url: string, schema: string) => {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}schema=${schema}`;
};

const baseUrl = process.env.POSTGRES_URL || process.env.POSTGRES_URL_PRISMA;
if (!baseUrl) {
  throw new Error('POSTGRES_URL or POSTGRES_URL_PRISMA must be set');
}

const schemaName = process.env.PRISMA_DB_SCHEMA || 'nkv_admin';
const hasSchemaParam = (process.env.POSTGRES_URL_PRISMA || '').includes('schema=');
const resolvedUrl = process.env.POSTGRES_URL_PRISMA
  ? hasSchemaParam
    ? process.env.POSTGRES_URL_PRISMA
    : appendSchemaParam(process.env.POSTGRES_URL_PRISMA, schemaName)
  : appendSchemaParam(baseUrl, schemaName);

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: resolvedUrl,
  },
});
