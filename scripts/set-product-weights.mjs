/**
 * Set product and variant weights in the database.
 *
 * Rules:
 *   - Variable products (Hakofyt): 1L variant → 1.2 kg, 5L variant → 6 kg
 *   - Mospilan 20 SP (simple): 0.6 kg
 *   - Bofix (simple): 0.1 kg
 *   - Product-level weight for variable products: null (weight lives on variants)
 */
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Load local environment variables when running the script manually.
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const buildConnectionString = () => {
  const base = process.env.POSTGRES_URL_PRISMA || process.env.POSTGRES_URL;
  if (!base) {
    throw new Error('POSTGRES_URL is required for Prisma');
  }

  const schema = process.env.PRISMA_DB_SCHEMA || 'nkv_admin';
  const hasSchemaParam = base.includes('schema=');
  if (hasSchemaParam || process.env.POSTGRES_URL_PRISMA) {
    return { connectionString: base, schema };
  }

  const separator = base.includes('?') ? '&' : '?';
  return { connectionString: `${base}${separator}schema=${schema}`, schema };
};

const { connectionString, schema } = buildConnectionString();
const pool = new Pool({ connectionString, options: `-c search_path=${schema}` });
const adapter = new PrismaPg(pool, { schema });
const prisma = new PrismaClient({ adapter });

const PRODUCT_WEIGHTS = {
  'mospilan-20-sp': 0.6,
  'bofix': 0.1,
};

const VARIANT_WEIGHT_RULES = [
  { pattern: /1\s*L/i, weight: 1.2 },
  { pattern: /5\s*L/i, weight: 6 },
];

function getVariantWeight(variantName) {
  for (const rule of VARIANT_WEIGHT_RULES) {
    if (rule.pattern.test(variantName)) return rule.weight;
  }
  return null;
}

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, slug: true, name: true, type: true, variants: true },
  });

  let updatedProducts = 0;
  let totalVariantUpdates = 0;

  for (const product of products) {
    // Simple products — set product-level weight
    if (product.type === 'simple' && PRODUCT_WEIGHTS[product.slug] !== undefined) {
      const weight = PRODUCT_WEIGHTS[product.slug];
      await prisma.product.update({
        where: { id: product.id },
        data: { weight },
      });
      console.log(`✓ ${product.name} (${product.slug}) → weight: ${weight} kg`);
      updatedProducts++;
      continue;
    }

    // Variable products — set weight on each variant
    if (product.type === 'variable' && Array.isArray(product.variants)) {
      let changed = false;
      const newVariants = product.variants.map((v) => {
        if (typeof v !== 'object' || v === null) return v;
        const variantWeight = getVariantWeight(v.name);
        if (variantWeight !== null && v.weight !== variantWeight) {
          changed = true;
          totalVariantUpdates++;
          console.log(`  → ${product.name} / ${v.name} → weight: ${variantWeight} kg`);
          return { ...v, weight: variantWeight };
        }
        return v;
      });

      if (changed) {
        // Set product-level weight to null for variable products (weight lives on variants)
        await prisma.product.update({
          where: { id: product.id },
          data: {
            weight: null,
            variants: newVariants,
          },
        });
        console.log(`✓ ${product.name} (${product.slug}) → variants updated`);
        updatedProducts++;
      }
    }
  }

  console.log(`\nDone: ${updatedProducts} products, ${totalVariantUpdates} variants updated`);
  await prisma.$disconnect();
  await pool.end();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  await pool.end();
  process.exitCode = 1;
});
