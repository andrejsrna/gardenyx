
import { getAllProducts, getProductsByIds as getLocalProductsByIds } from '../app/lib/products';
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
    console.log('Debugging local products (markdown source)...');
    console.log('Fetching hero product (824)...');
    try {
        const heroProduct = await getLocalProductsByIds([824]);
        console.log('Hero product count:', heroProduct.length);
        if (heroProduct.length > 0) {
            console.log('Hero product:', heroProduct[0].name, heroProduct[0].id);
        }
    } catch (e: any) {
        console.error('Hero fetch failed:', e.message);
    }

    console.log('Listing all products...');
    try {
        const all = await getAllProducts();
        console.log('Products found:', all.length);
        all.slice(0, 10).forEach(p => console.log(p.id, p.name, p.slug));
    } catch (e: any) {
        console.error('List fetch failed:', e.message);
    }
}

debug().catch(console.error);
