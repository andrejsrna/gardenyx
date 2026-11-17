import { packetaApiPassword, packetaCall } from './api';

export const packetaStatusTextMap: Record<number, string> = {
  1: 'received data',
  2: 'arrived',
  3: 'prepared for departure',
  4: 'departed',
  5: 'ready for pickup',
  6: 'handed to carrier',
  7: 'delivered',
  9: 'posted back',
  10: 'returned',
  11: 'cancelled',
  12: 'collected',
  14: 'customs',
  15: 'reverse packet arrived',
  16: 'delivery attempt',
  17: 'rejected by recipient',
  18: 'rejected by recipient',
  19: 'return from hd no branch nearby',
  20: 'storage time expired',
  21: 'packet cancelled but consigned',
  22: 'return overlimit',
  23: 'zbox delivery attempt',
  24: 'zbox last delivery attempt',
  25: 'carrier first delivery attempt',
  26: 'packet under investigation',
  27: 'packet investigation resolved',
  28: 'favourite point redirect',
  29: 'no favourite point available redirect',
  30: 'no favourite point set redirect',
  999: 'unknown',
};

/** Packeta codes that end an order as cancelled (returned, cancelled, storage expired...). */
const CANCELLED_CODES = new Set([10, 11, 20, 21, 22]);

/** Order status for a Packeta status code (values match the Prisma `OrderStatus` enum). */
export function mapPacketaStatusToOrderStatus(code: number): 'completed' | 'cancelled' | 'processing' {
  if (code === 7) return 'completed';
  if (CANCELLED_CODES.has(code)) return 'cancelled';
  return 'processing';
}

/** Payment status after a Packeta-driven order status change (values match Prisma `PaymentStatus`). */
export function resolvePaymentStatusAfterDelivery<P extends string>(
  orderStatus: 'completed' | 'cancelled' | 'processing',
  paymentMethod: string,
  current: P,
): P | 'paid' | 'failed' | 'refunded' {
  if (orderStatus === 'completed') return 'paid';
  if (orderStatus === 'cancelled') return paymentMethod === 'cod' ? 'failed' : 'refunded';
  return current;
}

export const hasPacketaCredentials = () => Boolean(packetaApiPassword(true));

/** Current packet status; throws on a Packeta fault so callers keep the stored status. */
export async function fetchPacketaStatus(packetId: string): Promise<{ code: number; text: string }> {
  const apiPassword = packetaApiPassword(true);
  if (!apiPassword) throw new Error('Missing Packeta API key');
  const result = await packetaCall<{ statusCode?: string; codeText?: string }>('packetStatus', { apiPassword, packetId });
  const code = Number(result?.statusCode || 999);
  return { code, text: result?.codeText || packetaStatusTextMap[code] || 'unknown' };
}
