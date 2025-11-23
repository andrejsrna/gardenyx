
import { getProductsByCategory, getProductsByIds, getProductCategories } from '../app/lib/wordpress';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Manually parse .env.local
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envConfig = dotenv.parse(fs.readFileSync(envPath));
        for (const k in envConfig) {
            process.env[k] = envConfig[k];
        }
        console.log('.env.local loaded manually');
    } else {
        console.log('.env.local not found at', envPath);
    }
} catch (e) {
    console.error('Error loading .env.local:', e);
}

async function debug() {
    const key = process.env.NEXT_PUBLIC_WOO_CONSUMER_KEY;
    console.log('Key loaded:', key ? 'Yes (' + key.substring(0, 5) + '...)' : 'No');

    console.log('Fetching hero product (824)...');
    try {
        const heroProduct = await getProductsByIds([824]);
        console.log('Hero product count:', heroProduct.length);
        if (heroProduct.length > 0) {
            console.log('Hero product:', heroProduct[0].name, heroProduct[0].id);
        }
    } catch (e: any) {
        console.error('Hero fetch failed:', e.message);
    }

    console.log('Fetching categories...');
    try {
        const categories = await getProductCategories();
        console.log('Categories found:', categories.length);
        categories.forEach(c => console.log(`${c.id}: ${c.name} (${c.slug}) - count: ${c.count}`));
    } catch (e: any) {
        console.error('Categories fetch failed:', e.message);
    }

    console.log('Fetching category products (akciove)...');
    try {
        const categoryProducts = await getProductsByCategory('akciove', 5);
        console.log('Category products count:', categoryProducts.length);
        categoryProducts.forEach(p => console.log(p.id, p.name));
    } catch (e: any) {
        console.error('Category fetch failed:', e.message);
    }
}

debug().catch(console.error);
