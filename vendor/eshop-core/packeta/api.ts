import { Builder, Parser } from 'xml2js';

/** Packeta SOAP-over-REST endpoint (XML in, XML out). */
export const PACKETA_API_URL = 'https://www.zasilkovna.cz/api/rest';

type Fault = { name?: string; fault?: string };
export type PacketaResponse<R = unknown> = {
  response?: {
    status?: string;
    string?: string;
    message?: string;
    fault?: string | { faultString?: string };
    detail?: { attributes?: { fault?: Fault | Fault[] } };
    result?: R;
  };
};

/** Human-readable error from a non-ok Packeta response, including per-attribute faults. */
export function formatPacketaFault(result: PacketaResponse | null | undefined) {
  const response = result?.response;
  const raw = response?.detail?.attributes?.fault;
  const attributes = (Array.isArray(raw) ? raw : raw ? [raw] : [])
    .map(f => (f?.fault ? `${f.name ?? 'unknown'}: ${f.fault}` : String(f?.name ?? 'unknown')))
    .join(' | ');
  const fault = typeof response?.fault === 'object' ? response.fault?.faultString : response?.fault;
  return [response?.string, response?.message, fault, attributes].filter(Boolean).join(' | ') || `Packeta status: ${response?.status}`;
}

/** API password: PACKETA_API_SECRET (NEXT_PUBLIC_PACKETA_API_KEY as legacy fallback for status reads). */
export function packetaApiPassword(allowPublicKey = false) {
  return process.env.PACKETA_API_SECRET || (allowPublicKey ? process.env.NEXT_PUBLIC_PACKETA_API_KEY : undefined) || null;
}

/** Raw call: `{ [method]: { apiPassword, ...params } }` as XML. Returns the fetch Response. */
export function packetaFetch(method: string, params: Record<string, unknown>) {
  const body = new Builder({ renderOpts: { pretty: false }, xmldec: { version: '1.0', encoding: 'UTF-8' } })
    .buildObject({ [method]: params });
  return fetch(PACKETA_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/xml', Accept: 'application/xml' },
    body,
  });
}

/** Calls a Packeta API method and returns `response.result`; throws with the Packeta fault text. */
export async function packetaCall<R>(method: string, params: Record<string, unknown>): Promise<R> {
  const res = await packetaFetch(method, params);
  const text = await res.text();
  if (!res.ok) throw new Error(`Packeta HTTP ${res.status}: ${res.statusText} :: ${text.slice(0, 500)}`);
  const parsed = (await new Parser({ explicitArray: false }).parseStringPromise(text)) as PacketaResponse<R>;
  if (parsed?.response?.status !== 'ok') throw new Error(formatPacketaFault(parsed));
  return parsed.response.result as R;
}
