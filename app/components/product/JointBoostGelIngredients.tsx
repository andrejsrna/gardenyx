import Image from 'next/image';
import { Beaker, Check, Leaf, ShieldCheck, Snowflake } from 'lucide-react';

type JointBoostGelIngredientsProps = {
  title?: string;
  subtitle?: string;
  imageSrc?: string;
  ingredients?: string[];
  notes?: string[];
  className?: string;
};

const defaultIngredients = [
  'Aqua',
  'Alcohol Denat.',
  'Glycerin',
  'Menthol',
  'Phenoxyethanol',
  'Carbomer',
  'Triethanolamine',
  'Mentha Piperita Oil',
  'PEG-40 Hydrogenated Castor Oil',
  'Camphor',
  'Dimethyl Sulfone (MSM)',
  'Eucalyptus Globulus Leaf Oil',
  'Sodium Fulvicum',
  'Triethylene Glycol',
  'Polyquaternium-7',
  'Methyl Salicylate',
  'Arnica Montana Flower Extract',
  'Limonene',
];

const defaultNotes = [
  'Určené na kozmetickú masáž pokožky v oblasti svalov a kĺbov.',
  'Naneste malé množstvo gélu na pokožku a jemnými pohybmi vmasírujte.',
  'Opakujte 3–4× denne alebo podľa potreby.',
  'Skladujte na suchom a chladnom mieste, mimo dosahu detí.',
  'Výrobok nie je určený pre deti do 6 rokov.',
  'Nepoužívajte na podráždenú alebo čerstvo oholenú pokožku.',
];

export default function JointBoostGelIngredients({
  title = 'Zloženie Joint Boost Gel',
  subtitle = 'Precízne namiešaná receptúra pre chladivú masáž kĺbov a svalov – presne podľa obalu.',
  imageSrc = '/jointboost-gel.jpg',
  ingredients = defaultIngredients,
  notes = defaultNotes,
  className = '',
}: JointBoostGelIngredientsProps) {
  return (
    <section
      className={`relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-emerald-100/70 p-6 shadow-[0_25px_70px_-40px_rgba(16,185,129,0.55)] md:p-10 ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(52,211,153,0.15),transparent_35%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(52,211,153,0.18),transparent_30%)] blur-3xl" />

      <div className="relative grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-emerald-700 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-white">
              Joint Boost Gel
            </span>
            <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800 shadow-sm">
              Ingredients &amp; Safety
            </span>
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold leading-tight text-gray-900 md:text-4xl">{title}</h2>
            <p className="text-lg text-gray-700 md:text-xl">{subtitle}</p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-emerald-100/80 bg-white/85 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between gap-4 border-b border-emerald-100/80 px-5 py-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
                <Beaker className="h-4 w-4" />
                Ingredients (INCI)
              </div>
              <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                <ShieldCheck className="h-4 w-4" />
                Kompletný zoznam
              </div>
            </div>
            <div className="grid gap-3 px-5 py-5 sm:grid-cols-2 xl:grid-cols-3">
              {ingredients.map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  className="group relative flex items-start gap-3 rounded-lg border border-emerald-50 bg-white/70 px-3 py-2 shadow-[0_6px_18px_-14px_rgba(16,185,129,0.6)] transition hover:-translate-y-0.5 hover:border-emerald-200/80"
                >
                  <span className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-800">
                    {index + 1}
                  </span>
                  <span className="text-sm font-semibold text-gray-800">{item}</span>
                  <span className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-50/0 via-emerald-50/0 to-emerald-50/0 transition duration-200 group-hover:from-emerald-50/60" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-100/80 bg-white/85 p-5 shadow-lg backdrop-blur">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-800">
              <Leaf className="h-4 w-4" />
              Použitie &amp; bezpečnosť
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {notes.map((note) => (
                <div key={note} className="flex items-start gap-3 rounded-lg bg-emerald-50/60 px-3 py-2">
                  <Check className="mt-0.5 h-5 w-5 text-emerald-700" />
                  <p className="text-sm font-semibold text-gray-800">{note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-white/80 shadow-2xl backdrop-blur">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-transparent to-white" />
            <div className="relative p-5">
              <div className="overflow-hidden rounded-2xl border border-emerald-50">
                <Image
                  src={imageSrc}
                  alt="Joint Boost chladivý gél"
                  width={640}
                  height={780}
                  className="h-full w-full rounded-2xl object-cover"
                />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
                  <Snowflake className="h-5 w-5" />
                  Chladivý efekt mentolu a eukalyptu
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
                  <ShieldCheck className="h-5 w-5" />
                  Lokálna masáž kĺbov a svalov
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
