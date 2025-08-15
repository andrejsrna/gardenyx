import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';
import {createHash} from 'crypto';
import {cookies} from 'next/headers';
import {NextResponse} from 'next/server';
import {Builder, Parser} from 'xml2js';
import {logError} from '../../../lib/utils/logger';

interface PacketaResponse {
    response: {
        status: string;
        result?: {
            id: string;
            barcode: string;
            barcodeText: string;
        };
        message?: string;
    };
}

interface WooCommerceError extends Error {
    response?: {
        data: {
            message?: string;
            [key: string]: unknown;
        };
        status?: number;
    };
}

interface MetaData {
    key: string;
    value: string;
}

interface OrderData {
    shipping_method: string;
    payment_method: string;
    status?: string;
    shipping: {
        first_name: string;
        last_name: string;
        address_1: string;
        city: string;
        postcode: string;
    };
    billing: {
        email: string;
        phone: string;
    };
    meta_data?: MetaData[];
    line_items: Array<{
        product_id: number;
        quantity: number;
    }>;
    total?: string; // Ensure total exists if used for COD
}

// Nové rozhranie pre idempotentnosť
interface OrderRequestWithIdempotencyKey extends OrderData {
    idempotency_key?: string;
    meta_data?: MetaData[];
}

// Pridám rozhranie pre WooCommerce objednávku
interface WooCommerceOrder {
    id: number;
    total: string; // Ensure total is present in the response
    meta_data?: Array<{
        key: string;
        value: string;
    }>;
    // Ďalšie polia, ktoré môžu byť potrebné
}

const PACKETA_API_URL = 'https://www.zasilkovna.cz/api/rest';
const PACKETA_API_PASSWORD = process.env.PACKETA_API_SECRET;
const PACKETA_CARRIER_ID = '131'; // ID pre Slovensko home delivery

// Initialize the WooCommerce API with your credentials
const api = new WooCommerceRestApi({
    url: process.env.WORDPRESS_URL!,
    consumerKey: process.env.WC_CONSUMER_KEY!,
    consumerSecret: process.env.WC_CONSUMER_SECRET!,
    version: 'wc/v3'
});

// Pomocná funkcia na generovanie hash-u pre idempotentnosť
function generateOrderHash(orderData: OrderData): string {
    // Vytvorenie konzistentného reťazca z kľúčových údajov objednávky
    const orderSignature = JSON.stringify({
        billing_email: orderData.billing.email,
        billing_phone: orderData.billing.phone,
        line_items: orderData.line_items,
        shipping_method: orderData.shipping_method,
        payment_method: orderData.payment_method
    });

    // Vytvorenie hash-u
    return createHash('sha256').update(orderSignature).digest('hex');
}

// Funkcia na kontrolu existujúcej objednávky podľa idempotency_key
async function findExistingOrder(idempotencyKey: string) {
    try {
        // Hľadáme objednávku s daným idempotency_key v meta_data
        const response = await api.get('orders', {
            per_page: 100,
            orderby: 'date',
            order: 'desc',
            status: ['pending', 'processing', 'on-hold', 'completed']
        });

        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            // Hľadáme objednávku s rovnakým idempotency_key
            const existingOrder = response.data.find((order: WooCommerceOrder) =>
                order.meta_data?.some((meta: { key: string; value: string }) =>
                    meta.key === '_idempotency_key' && meta.value === idempotencyKey
                )
            );

            return existingOrder || null;
        }

        return null;
    } catch (error) {
        return null;
    }
}

/**
 * Parses a combined address string into street and house number.
 * Handles formats like "Street Name 123", "Street Name 123/A", "Street 123/456".
 * If no number is found, returns the whole string as street.
 */
function parseAddress(addressLine: string): { street: string; houseNumber: string } {
    if (!addressLine) {
        return {street: '', houseNumber: ''};
    }

    // Regex to find a number (potentially with slashes/letters) at the end, possibly preceded by a space.
    const match = addressLine.match(/^(.*?)\s*([\d/A-Za-z-]+)$/);

    if (match && match[2] && /\d/.test(match[2])) {
        // Found a number part at the end
        const street = (match[1] || '').trim();
        const houseNumber = match[2].trim();
        return {street, houseNumber};
    } else {
        // No number found at the end, assume the whole string is the street
        return {street: addressLine.trim(), houseNumber: ''};
    }
}

async function createPacketaPacket(orderData: OrderData, orderId: number, total: number) {
    try {
        if (!PACKETA_API_PASSWORD) {
            throw new Error('Missing Packeta API Password');
        }
        const isHomeDelivery = orderData.shipping_method === 'packeta_home';

        // Base packet attributes
        const packetAttributes: Record<string, string | undefined> = {
            number: orderId.toString(),
            name: orderData.shipping.first_name,
            surname: orderData.shipping.last_name,
            email: orderData.billing.email,
            phone: orderData.billing.phone.replace(/\s/g, ''), // Ensure phone has no spaces for Packeta
            value: total.toString(),
            currency: 'EUR',
            weight: calculateTotalWeight(orderData.line_items).toString(),
            eshop: 'FITDOPLNKY',
            cod: orderData.payment_method === 'cod' ? total.toString() : undefined
        };

        // Add delivery specific attributes
        if (isHomeDelivery) {
            // Use the new parsing function
            const {street, houseNumber} = parseAddress(orderData.shipping.address_1);

            if (!street && !houseNumber) {
                throw new Error(`Invalid address format for home delivery: ${orderData.shipping.address_1}`);
            }
            // Packeta requires houseNumber for home delivery (even if empty string initially)
            if (!houseNumber) {
                logError('Packeta Address Warning', {
                    error: {
                        message: `Address '${orderData.shipping.address_1}' parsed without house number. Sending empty houseNumber.`,
                        parsedStreet: street,
                        parsedHouseNumber: houseNumber
                    },
                    orderId: orderId.toString(),
                    timestamp: new Date().toISOString()
                });
            }


            Object.assign(packetAttributes, {
                addressId: PACKETA_CARRIER_ID, // Use the specific carrier ID for home delivery
                street: street,
                houseNumber: houseNumber, // Send parsed house number (might be empty)
                city: orderData.shipping.city,
                zip: orderData.shipping.postcode.replace(/\s/g, '') // Ensure zip has no spaces
            });
        } else {
            // Pre pickup point potrebujeme len ID výdajného miesta
            const pointId = orderData.meta_data?.find((m: MetaData) => m.key === '_packeta_point_id')?.value;
            if (!pointId) {
                throw new Error('Missing Packeta point ID for pickup delivery');
            }
            Object.assign(packetAttributes, {
                addressId: pointId // Use the selected pickup point ID
            });
        }

        // Prepare XML request
        const xmlData = {
            createPacket: {
                apiPassword: PACKETA_API_PASSWORD,
                packetAttributes
            }
        };

        // Convert to XML with proper formatting
        const builder = new Builder({
            renderOpts: {pretty: true, indent: '  '},
            xmldec: {version: '1.0', encoding: 'UTF-8'}
        });
        const xmlRequest = builder.buildObject(xmlData);

        //  ("Sending to Packeta:", xmlRequest); // Uncomment for debugging XML

        const response = await fetch(PACKETA_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml',
                'Accept': 'application/xml'
            },
            body: xmlRequest
        });

        const responseText = await response.text();
        //  ("Received from Packeta:", responseText); // Uncomment for debugging XML response

        if (!response.ok) {
            throw new Error(`Failed to create Packeta packet: ${response.statusText}. Response: ${responseText}`);
        }

        const parser = new Parser({explicitArray: false});
        const result = await parser.parseStringPromise(responseText) as PacketaResponse;

        if (result.response?.status !== 'ok') {
            throw new Error(result.response?.message || `Failed to create Packeta packet: ${result.response?.status}`);
        }

        if (!result.response.result) {
            throw new Error('Missing result data in Packeta response');
        }

        // Update order with Packeta tracking data
        try {
            await api.put(`orders/${orderId}`, {
                meta_data: [
                    {key: '_packeta_packet_id', value: result.response.result.id},
                    {key: '_packeta_barcode', value: result.response.result.barcode},
                    {key: '_packeta_barcode_text', value: result.response.result.barcodeText}
                ]
            });
        } catch (updateError) {
            logError('WooCommerce Order Update Failed (Packeta Data)', {
                error: {
                    updateError,
                    packetaId: result.response.result.id
                },
                orderId: orderId.toString(),
                timestamp: new Date().toISOString()
            });
            // Continue even if update fails, Packeta packet was created
        }


        return result.response.result;

    } catch (error) {
        logError('Packeta Packet Creation Failed', {
            error: error instanceof Error ? error.message : String(error),
            orderId: orderId.toString(),
            customerEmail: orderData.billing.email,
            timestamp: new Date().toISOString()
        });
        // Re-throw the error so the main POST handler knows it failed
        throw error;
    }
}

function calculateTotalWeight(lineItems: Array<{ product_id: number; quantity: number }>): number {
    // TODO: Implement actual weight calculation based on products
    // For now, using a default weight per item
    return lineItems.reduce((total, item) => total + (item.quantity * 0.5), 0);
}

export async function POST(request: Request) {
    try {
        // Získame dáta objednávky
        const orderData: OrderRequestWithIdempotencyKey = await request.json();

        // Získame alebo vygenerujeme idempotency key
        const idempotencyKey = orderData.idempotency_key || generateOrderHash(orderData);

        // Skontrolujeme, či už existuje objednávka s týmto idempotency key
        const existingOrder = await findExistingOrder(idempotencyKey);

        if (existingOrder) {
            return NextResponse.json({
                order: existingOrder,
                isExisting: true
            });
        }
        if (!orderData.meta_data) {
            orderData.meta_data = [];
        }
        if (!orderData.meta_data.some(m => m.key === '_idempotency_key')) {
            orderData.meta_data.push({
                key: '_idempotency_key',
                value: idempotencyKey
            });
        }

        const cookiesStore = await cookies();
        const sessionId = cookiesStore.get('next-auth.session-token')?.value ||
            cookiesStore.get('__Secure-next-auth.session-token')?.value ||
            request.headers.get('x-session-id');

        if (sessionId) {
            if (!orderData.meta_data.some(m => m.key === '_session_id')) {
                orderData.meta_data.push({
                    key: '_session_id',
                    value: sessionId
                });
            }
        }
        delete orderData.idempotency_key;
        const finalPayload = {
            ...orderData,
            status: orderData.status || 'pending'
        };
        const response = await api.post('orders', finalPayload);

        if (!response.data || !response.data.id) {
            throw new Error('Invalid response from WooCommerce when creating order');
        }

        const newOrder = response.data as WooCommerceOrder;

        if (
            (orderData.shipping_method === 'packeta_pickup' || orderData.shipping_method === 'packeta_home') &&
            finalPayload.status === 'processing'
        ) {
            try {
                await createPacketaPacket(orderData, newOrder.id, Number(newOrder.total));
                } catch (packetaError) {
                try {
                    await api.put(`orders/${newOrder.id}`, {
                        status: 'on-hold', // Or a custom status
                        customer_note: `Automatické vytvorenie zásielky v Packete zlyhalo. Prosím, skontrolujte manuálne. Chyba: ${(packetaError instanceof Error ? packetaError.message : String(packetaError))}`
                    });
                } catch (updateError) {
                }
            }
        }

        return NextResponse.json({
            order: newOrder,
            isExisting: false
        });

    } catch (error: unknown) {

        const err = error as WooCommerceError;

        if (err.response?.data) {
            logError('WooCommerce API Error (Order Creation)', {
                error: {
                    apiError: err.response.data,
                    status: err.response.status
                },
                timestamp: new Date().toISOString()
            });
            return NextResponse.json(
                {
                    error: {
                        message: err.response.data.message || 'WooCommerce API error',
                        details: err.response.data
                    }
                },
                {status: err.response.status || 500}
            );
        }

        logError('Internal Server Error (Order Creation)', {
            error: {
                message: (err as Error).message || String(err),
                stack: (err as Error).stack
            },
            timestamp: new Date().toISOString()
        });
        return NextResponse.json(
            {
                error: {
                    message: (err as Error).message || 'Internal server error',
                    details: process.env.NODE_ENV === 'development' ? err : undefined
                }
            },
            {status: 500}
        );
    }
}
