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

// Initialize WooCommerce API
const api = new WooCommerceRestApi({
    url: process.env.NEXT_PUBLIC_WORDPRESS_URL!,
    consumerKey: process.env.WC_CONSUMER_KEY!,
    consumerSecret: process.env.WC_CONSUMER_SECRET!,
    version: 'wc/v3',
    queryStringAuth: true
});

export async function GET(request: Request) {
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
