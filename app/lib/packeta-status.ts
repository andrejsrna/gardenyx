import { OrderStatus } from '@prisma/client';
import { Builder, Parser } from 'xml2js';

const PACKETA_API_URL = 'https://www.zasilkovna.cz/api/rest';
const PACKETA_API_KEY = process.env.PACKETA_API_SECRET || process.env.NEXT_PUBLIC_PACKETA_API_KEY;

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
  999: 'unknown'
};

export const hasPacketaCredentials = () => Boolean(PACKETA_API_KEY);

export const mapPacketaStatusToOrderStatus = (code: number): OrderStatus => {
  if (code === 7) return OrderStatus.completed;
  if ([10, 11, 20, 21, 22].includes(code)) return OrderStatus.cancelled;
  return OrderStatus.processing;
};

export async function fetchPacketaStatus(packetId: string): Promise<{ code: number; text: string }> {
  if (!PACKETA_API_KEY) throw new Error('Missing Packeta API key');

  const builder = new Builder({
    renderOpts: { pretty: false },
    xmldec: { version: '1.0', encoding: 'UTF-8' }
  });

  const xmlRequest = builder.buildObject({
    packetStatus: {
      apiPassword: PACKETA_API_KEY,
      packetId
    }
  });

  const response = await fetch(PACKETA_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/xml',
      'Accept': 'application/xml'
    },
    body: xmlRequest
  });

  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(`Packeta status failed: ${response.statusText} ${responseText}`);
  }

  const parser = new Parser({ explicitArray: false });
  const parsed = await parser.parseStringPromise(responseText) as {
    response?: { status?: string; result?: { statusCode?: string; codeText?: string } }
  };

  const code = Number(parsed?.response?.result?.statusCode || 999);
  const text = parsed?.response?.result?.codeText || packetaStatusTextMap[code] || 'unknown';

  return { code, text };
}
