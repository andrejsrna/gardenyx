import { Award, Check, Clock, Pill, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { Link } from '../../i18n/navigation';

const STATS = [
  {
    icon: Check,
    value: '9',
    label: 'účinných zložiek',
  },
  {
    icon: Pill,
    value: '1 kapsula',
    label: 'denne',
  },
  {
    icon: Award,
    value: 'Certifikácia',
    label: 'RÚVZ',
  },
  {
    icon: Clock,
    value: '510 mg',
    label: 'v 1 kapsuli',
  },
] as const;

const HIGHLIGHTS = [
  'Zmysluplné dávkovanie pre dlhodobé užívanie',
  'Transparentné zloženie bez marketingových skratok',
  'Prémiové suroviny od overených dodávateľov',
] as const;

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute -bottom-24 right-0 h-[420px] w-[420px] rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),transparent_60%)]" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-emerald-50/80 via-transparent" />
      </div>

      <div className="container mx-auto px-4 pb-20 pt-24 lg:pb-28 lg:pt-32">
        <div className="grid items-center gap-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="space-y-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white/70 px-4 py-1.5 text-sm font-semibold text-emerald-700 shadow-sm shadow-emerald-200/40">
              <Sparkles className="h-4 w-4" />
              Prémiová kĺbová výživa
            </div>

            <div className="space-y-6">
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Vitajte u špecialistu na najsilnejšiu kĺbovú výživu
              </h1>

              <p className="max-w-xl text-lg leading-relaxed text-slate-600">
                Prečo sme najsilnejší? Pretože útočíme na bolesť z dvoch strán. Náš unikátny <strong>Duo Set</strong> kombinuje prémiovú kĺbovú výživu pre hĺbkovú regeneráciu a protizápalový gél pre okamžitú úľavu. Maximálny účinok, ktorý pocítite.
              </p>

              <ul className="space-y-3 text-sm text-slate-600">
                {HIGHLIGHTS.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-base font-medium text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center">
                <Link
                  href="/kupit"
                  className="group relative inline-flex items-center justify-center overflow-hidden rounded-full px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200/60 transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 transition-transform duration-300 group-hover:scale-110" />
                  <span className="relative flex items-center gap-2">
                    Pozrieť produkty
                  </span>
                </Link>
                <Link
                  href="https://www.youtube.com/watch?v=wgRs0hHTfDo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-full border border-emerald-200/80 bg-white/70 px-7 py-3 text-sm font-semibold text-emerald-700 transition-all hover:border-emerald-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
                >
                  Ako to funguje
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-500">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/60 px-3 py-1 text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  200+ objednávok od 2023
                </span>
                <span>0 reklamácií</span>
                <span>Overené platby</span>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {STATS.map(({ icon: Icon, value, label }) => (
                <div
                  key={value}
                  className="group flex flex-col gap-2 rounded-2xl border border-emerald-100/80 bg-white/80 p-5 shadow-sm shadow-emerald-100/60 transition-all duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-100">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{value}</p>
                    <p className="text-sm text-slate-500">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[520px]">
            <div className="absolute -top-12 left-1/2 hidden -translate-x-1/2 md:flex">
              <div className="rounded-full border border-emerald-200/50 bg-white/80 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm shadow-emerald-200">
                Klinicky overené zložky
              </div>
            </div>
            <div className="relative overflow-hidden rounded-[40px] border border-emerald-100 bg-white/70 p-6 shadow-[0_40px_80px_-40px_rgba(16,185,129,0.45)] backdrop-blur-xl">
              <div className="absolute -inset-6 -z-10 rounded-[52px] bg-gradient-to-br from-emerald-400/10 via-green-300/5 to-transparent" />
              <div className="relative h-full w-full rounded-3xl bg-emerald-50/40 p-6">
                <div className="absolute inset-x-10 -top-6 h-20 rounded-full bg-white/80 blur-3xl" />
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl bg-white shadow-xl">
                  <Image
                    src="/home-hero.jpeg"
                    alt="Kĺbová výživa produkt"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="mt-6 flex items-center justify-between rounded-2xl border border-emerald-100 bg-white/80 p-4 text-sm text-slate-600">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-emerald-500">Doručenie</p>
                    <p className="font-semibold text-slate-900">Do 24-48 hodín po objednaní</p>
                  </div>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <Clock className="h-5 w-5" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
