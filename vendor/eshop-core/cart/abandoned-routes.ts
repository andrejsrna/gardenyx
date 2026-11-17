import type { AbandonedItem } from './abandoned';
import { rateLimit } from '../utils/rateLimit';

type Engine<L extends string> = {
  parseSaveRequest(body: unknown): { email: string; items: AbandonedItem[]; locale: L } | null;
  save(email: string, items: AbandonedItem[], locale: NoInfer<L>): Promise<boolean>;
  restore(token: string): Promise<unknown[] | null>;
};

/**
 * Route handlers for `app/api/cart/abandoned/route.ts`:
 *   export const { POST, GET } = createAbandonedCartHandlers(abandonedCart);
 * POST stores the cart (rate limited per IP), GET ?token= returns priced lines for the restore page.
 */
export function createAbandonedCartHandlers<L extends string>(engine: Engine<L>) {
  async function POST(request: Request) {
    const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0]?.trim() || 'unknown';
    try {
      await rateLimit(ip, 'newsletter');
    } catch {
      return Response.json({ error: 'Too many requests' }, { status: 429 });
    }
    const parsed = engine.parseSaveRequest(await request.json().catch(() => null));
    if (!parsed || !(await engine.save(parsed.email, parsed.items, parsed.locale))) {
      return Response.json({ error: 'Invalid cart data' }, { status: 400 });
    }
    return Response.json({ success: true });
  }

  async function GET(request: Request) {
    const items = await engine.restore(new URL(request.url).searchParams.get('token') || '');
    return items ? Response.json({ items }) : Response.json({ error: 'Not found' }, { status: 404 });
  }

  return { POST, GET };
}
