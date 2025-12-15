import prisma from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

type ReviewRow = {
  id: string;
  email: string;
  token: string;
  couponCode: string | null;
  rating: number | null;
  content: string | null;
  createdAt: Date;
  usedAt: Date | null;
  name: string | null;
};

async function fetchReviews(): Promise<ReviewRow[]> {
  const delegate = (prisma as unknown as { reviewRequest?: { findMany: (args: unknown) => Promise<ReviewRow[]> } }).reviewRequest;
  if (delegate?.findMany) {
    return delegate.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });
  }
  return prisma.$queryRawUnsafe<ReviewRow[]>(`SELECT * FROM "ReviewRequest" ORDER BY "createdAt" DESC LIMIT 100`);
}

const statusBadge = (usedAt: Date | null) => {
  const isUsed = Boolean(usedAt);
  const base = 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold';
  return (
    <span className={`${base} ${isUsed ? 'bg-emerald-500/15 text-emerald-200' : 'bg-amber-500/15 text-amber-200'}`}>
      {isUsed ? 'odoslané' : 'čaká na recenziu'}
    </span>
  );
};

function formatDate(value: string | Date | null | undefined) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('sk-SK', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default async function ReviewsAdminPage() {
  const reviews = await fetchReviews();

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-900/10">
        <h1 className="text-2xl font-semibold text-white">Recenzie (tokens)</h1>
        <p className="text-sm text-slate-300 mt-1">Poslané tokeny na recenziu a ich stav.</p>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-0 shadow-xl shadow-emerald-900/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead className="bg-slate-900/80 text-slate-300">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Token</th>
                <th className="px-4 py-3 text-left font-medium">Kupón</th>
                <th className="px-4 py-3 text-left font-medium">Rating</th>
                <th className="px-4 py-3 text-left font-medium">Obsah</th>
                <th className="px-4 py-3 text-left font-medium">Vytvorené</th>
                <th className="px-4 py-3 text-left font-medium">Odoslané</th>
                <th className="px-4 py-3 text-left font-medium">Stav</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-950/40">
              {reviews.map((r) => (
                <tr key={r.id} className="hover:bg-slate-900/50">
                  <td className="px-4 py-3 text-slate-200">{r.email}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-300">{r.token}</td>
                  <td className="px-4 py-3 text-slate-200">{r.couponCode || '—'}</td>
                  <td className="px-4 py-3 text-slate-200">{r.rating ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-300 max-w-xs truncate" title={r.content || undefined}>{r.content || '—'}</td>
                  <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{formatDate(r.createdAt)}</td>
                  <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{r.usedAt ? formatDate(r.usedAt) : '—'}</td>
                  <td className="px-4 py-3">{statusBadge(r.usedAt)}</td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-slate-300">
                    Zatiaľ žiadne tokeny na recenziu.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
