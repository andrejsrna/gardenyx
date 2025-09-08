import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';
import {NextResponse} from 'next/server';

interface WooCommerceCategory {
    id: number;
    name: string;
    slug: string;
}

interface WooCommerceProduct {
    id: number;
    name: string;
    slug: string;
    categories: WooCommerceCategory[];
}

interface WooCommerceError extends Error {
    response?: {
        status: number;
        data: {
            message?: string;
            [key: string]: unknown;
        };
    };
}

export async function GET(request: Request) {
    // Guard against missing environment configuration
    if (!process.env.WORDPRESS_URL || !process.env.WC_CONSUMER_KEY || !process.env.WC_CONSUMER_SECRET) {
        return NextResponse.json(
            { message: 'WooCommerce API is not configured' },
            { status: 500 }
        );
    }

    // Initialize WooCommerce API (inside handler to avoid init with missing envs)
    const api = new WooCommerceRestApi({
        url: process.env.WORDPRESS_URL!,
        consumerKey: process.env.WC_CONSUMER_KEY!,
        consumerSecret: process.env.WC_CONSUMER_SECRET!,
        version: 'wc/v3',
        queryStringAuth: true
    });
    if (!request.url) {
        return NextResponse.json({ error: 'Invalid request URL' }, { status: 400 });
    }
    const {searchParams} = new URL(request.url);
    const taxonomy = searchParams.get('taxonomy');
    const include = searchParams.get('include');

    try {
        const queryParams: {
            per_page: number;
            status: string;
            category?: string;
            include?: string;
        } = {
            per_page: 100,
            status: 'publish'
        };

        if (taxonomy) {
            queryParams.category = taxonomy;
        }

        if (include) {
            queryParams.include = include;
        }

        const response = await api.get('products', queryParams);
        const data = response.data as WooCommerceProduct[];

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching products:', error);

        if (error instanceof Error && 'response' in error) {
            const wcError = error as WooCommerceError;
            console.error('WooCommerce API error details:', {
                status: wcError.response?.status,
                data: wcError.response?.data,
                message: wcError.message
            });

            return NextResponse.json(
                {message: wcError.response?.data?.message || 'Failed to fetch products'},
                {status: wcError.response?.status || 500}
            );
        }

        return NextResponse.json(
            {message: error instanceof Error ? error.message : 'Failed to fetch products'},
            {status: 500}
        );
    }
}
