import { Parser } from 'xml2js';
import { formatPacketaFault, packetaApiPassword, packetaFetch, type PacketaResponse } from './api';

/** Shipping label PDF for a packet ("A6 on A4" by default). Packeta answers with PDF or XML-wrapped base64. */
export async function fetchPacketaLabelPdf(packetId: string, format = 'A6 on A4'): Promise<Buffer> {
  const apiPassword = packetaApiPassword();
  if (!apiPassword) throw new Error('Missing PACKETA_API_SECRET');
  const res = await packetaFetch('packetLabelPdf', { apiPassword, packetId, format, offset: 0 });
  if ((res.headers.get('content-type') || '').includes('pdf')) return Buffer.from(await res.arrayBuffer());

  const text = await res.text();
  const parsed = (await new Parser({ explicitArray: false }).parseStringPromise(text).catch(() => null)) as PacketaResponse<string> | null;
  if (!parsed) throw new Error('Invalid Packeta response');
  if (parsed.response?.status !== 'ok') throw new Error(formatPacketaFault(parsed));
  if (!parsed.response.result) throw new Error('Empty label response');
  return Buffer.from(parsed.response.result, 'base64');
}

/** Route response for a label download. */
export function labelPdfResponse(pdf: Buffer, filename: string) {
  return new Response(new Uint8Array(pdf), {
    headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${filename}"` },
  });
}
