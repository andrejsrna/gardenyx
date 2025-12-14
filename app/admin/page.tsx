import Link from 'next/link';

const metrics = [
  { label: 'Tržby (30d)', value: '€42 380', change: '+8.4%' },
  { label: 'Objednávky', value: '612', change: '+3.1%' },
  { label: 'Priem. hodnota', value: '€69.30', change: '+1.9%' },
  { label: 'Konverzný pomer', value: '3.4%', change: '+0.6%' },
];

const recentOrders = [
  { id: '#4812', customer: 'Jana K.', total: '€129.00', status: 'spracovanie', channel: 'E‑shop' },
  { id: '#4809', customer: 'Peter V.', total: '€58.50', status: 'odoslaná', channel: 'Packeta' },
  { id: '#4801', customer: 'Lucia H.', total: '€92.70', status: 'čaká na platbu', channel: 'GoPay' },
  { id: '#4796', customer: 'Martin D.', total: '€34.90', status: 'doručená', channel: 'E‑shop' },
];

const latestPosts = [
  { title: 'Bolestivé zápästie: čo pomáha', date: '12.02.2025', status: 'Zverejnené' },
  { title: 'Rehabilitácia po operácii kolena', date: '08.02.2025', status: 'Koncept' },
  { title: 'Ako vybrať správnu ortézu', date: '03.02.2025', status: 'Naplánované' },
];

export default function AdminPage() {
  return (
    <div className="space-y-10">
      <header className="rounded-3xl border border-slate-800 bg-gradient-to-r from-emerald-500/15 via-slate-900 to-slate-950 p-8 shadow-2xl shadow-emerald-900/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-300/80">Admin</p>
            <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Riadiaca doska</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Rýchly prehľad objednávok, obsahu a zdravia kampaní. Čísla sú zatiaľ statické – napojíme na API, keď budú dostupné.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="rounded-full border border-emerald-400/60 bg-emerald-500/15 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:bg-emerald-500/25">
              Exportovať prehľad
            </button>
            <button className="rounded-full border border-slate-700 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-emerald-400/60 hover:text-emerald-100">
              Nastavenia
            </button>
          </div>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-emerald-900/10"
          >
            <p className="text-sm text-slate-400">{metric.label}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{metric.value}</p>
            <p className="mt-2 text-xs font-medium text-emerald-300">{metric.change} vs. predchádzajúce obdobie</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-900/10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Posledné objednávky</h2>
            <button className="text-sm text-emerald-300 hover:text-emerald-200">Zobraziť všetky</button>
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-800">
            <table className="min-w-full divide-y divide-slate-800 text-sm">
              <thead className="bg-slate-900/80 text-slate-300">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">ID</th>
                  <th className="px-4 py-3 text-left font-medium">Zákazník</th>
                  <th className="px-4 py-3 text-left font-medium">Celkom</th>
                  <th className="px-4 py-3 text-left font-medium">Stav</th>
                  <th className="px-4 py-3 text-left font-medium">Kanál</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 bg-slate-950/40">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-900/60">
                    <td className="px-4 py-3 font-semibold text-white">{order.id}</td>
                    <td className="px-4 py-3 text-slate-200">{order.customer}</td>
                    <td className="px-4 py-3 text-slate-100">{order.total}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{order.channel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-emerald-900/10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Obsah</h2>
              <button className="text-sm text-emerald-300 hover:text-emerald-200">Spravovať články</button>
            </div>
            <div className="mt-4 space-y-4">
              {latestPosts.map((post) => (
                <div key={post.title} className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                  <p className="text-sm text-slate-300">{post.date}</p>
                  <p className="mt-1 text-base font-semibold text-white">{post.title}</p>
                  <span className="mt-2 inline-flex rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-emerald-200">
                    {post.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-emerald-500/20 via-slate-900 to-slate-950 p-6 shadow-xl shadow-emerald-900/15">
            <h3 className="text-lg font-semibold text-white">Rýchle akcie</h3>
            <div className="mt-4 space-y-3">
              <button className="w-full rounded-2xl bg-white/10 px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-white/20">
                + Vytvoriť nový článok
              </button>
              <Link
                href="/admin/newsletter"
                className="block w-full rounded-2xl bg-white/10 px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-white/20"
              >
                + Newsletter kampaň
              </Link>
              <button className="w-full rounded-2xl bg-white/10 px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-white/20">
                + Vygenerovať kupón
              </button>
              <button className="w-full rounded-2xl bg-white/10 px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-white/20">
                + Export objednávok
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
