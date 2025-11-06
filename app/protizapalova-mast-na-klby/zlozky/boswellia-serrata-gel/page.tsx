import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Activity, Droplets, HandHeart, Leaf, Snowflake, Sparkles, Timer } from 'lucide-react';
import Products from '../../../components/landing-page/Products';

export const metadata: Metadata = {
  title: 'Boswellia serrata gél – prírodná protizápalová starostlivosť o kĺby',
  description:
    'Boswellia serrata gél prináša chladivú úľavu pre kĺby, svaly a šľachy. Objav protizápalové účinky prírodných extraktov bez mastného pocitu na pokožke.',
};

const heroHighlights = [
  {
    title: 'Chladivý efekt do pár minút',
    description: 'Mentol a gáfor prinášajú okamžité osvieženie a úľavu po každom pohybe.',
    icon: Snowflake,
  },
  {
    title: 'Regenerácia kĺbov a svalov',
    description: 'Boswellia serrata a MSM podporujú pružnosť tkanív a uvoľňujú napätie.',
    icon: HandHeart,
  },
  {
    title: 'Vstrebateľnosť bez kompromisov',
    description: 'Ľahké zloženie sa absorbuje do pokožky bez mastných stôp či lepivého pocitu.',
    icon: Sparkles,
  },
];

const benefits = [
  { label: 'Pomáha zmierniť napätie a stuhnutosť kĺbov', icon: Activity },
  { label: 'Podporuje prirodzenú regeneráciu svalov a šliach', icon: HandHeart },
  { label: 'Zlepšuje prekrvenie a prináša pocit úľavy', icon: Droplets },
  { label: 'Vhodný po športovom výkone aj pri každodennom preťažení', icon: Timer },
  { label: 'Rýchlo sa vstrebáva, nezanecháva mastný film', icon: Sparkles },
];

const ingredients = [
  {
    title: 'Boswellia serrata extrakt',
    description: 'Podporuje zdravie kĺbov a znižuje zápalové procesy.',
    icon: Leaf,
  },
  {
    title: 'MSM (metylsulfonylmetán)',
    description: 'Zodpovedá za regeneráciu a pružnosť tkanív.',
    icon: Sparkles,
  },
  {
    title: 'Arnika montana extrakt',
    description: 'Revitalizuje a osviežuje pokožku.',
    icon: HandHeart,
  },
  {
    title: 'Mentol a gáfor',
    description: 'Prinášajú okamžitý chladivý účinok a úľavu.',
    icon: Snowflake,
  },
  {
    title: 'Glukozamín a chondroitín',
    description: 'Podporujú chrupavky a pohyblivosť kĺbov.',
    icon: Activity,
  },
];

const targetUsers = [
  'Pre športovcov a fyzicky aktívnych ľudí',
  'Pre seniorov so zníženou pohyblivosťou',
  'Pre tých, ktorí trpia stuhnutosťou alebo preťažením kĺbov',
  'Pre každého, kto uprednostňuje prírodné riešenie pred tabletkami',
];

const highlightStats = [
  { value: '11,90 €', label: 'Cena za balenie' },
  { value: '24 h', label: 'Doručenie na adresu' },
  { value: '0 %', label: 'Mastný pocit po aplikácii' },
];

const usageSteps = [
  {
    title: 'Nanášaj cielene',
    description:
      'Primerané množstvo gélu nanes na kolená, ramená či chrbát a jemne masíruj 1–2 minúty.',
    icon: HandHeart,
  },
  {
    title: 'Používaj pravidelne',
    description:
      'Pre dlhodobý efekt opakuj aplikáciu 2–3× denne alebo podľa potreby po záťaži.',
    icon: Timer,
  },
  {
    title: 'Podpor absorpciu',
    description: 'Pokožku pred aplikáciou jemne nahriaj alebo sprchuj teplou vodou.',
    icon: Sparkles,
  },
];

const synergyPoints = [
  {
    title: 'Kombinuj s Joint Boost kapsulami',
    description:
      'Zabezpečíš tak dvojitý účinok – Boswellia pôsobí zvonka, zatiaľ čo komplex Joint Boost pracuje zvnútra.',
  },
  {
    title: 'Zapoj šetrné cvičenie',
    description:
      'Jemné mobilizačné cviky a strečing zvyšujú prekrvenie a pomáhajú látkam rýchlejšie sa dostať k tkanivám.',
  },
  {
    title: 'Dostatok hydratácie',
    description:
      'Pitný režim a protizápalová strava podporujú prirodzené regeneračné procesy organizmu.',
  },
];

export default function BoswelliaSerrataGelPage() {
  return (
    <main className="bg-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-emerald-100/40 py-16 md:py-24">
        <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent)] md:block" />
        <div className="container relative mx-auto px-4">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div className="space-y-6 text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                🌿 Boswellia serrata gél
              </span>
              <h1 className="text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
                Boswellia serrata gél – prírodná protizápalová starostlivosť o kĺby
              </h1>
              <p className="text-lg text-gray-600 md:text-xl">
                Boswellia serrata gél je moderný protizápalový gél s prírodným zložením určený na starostlivosť
                o kĺby a svaly. Obsahuje výťažok z kadidlovníka indického, ktorý zlepšuje pohyblivosť,
                uvoľňuje stuhnutosť a podporuje regeneráciu po záťaži – navyše s príjemným chladivým efektom.
              </p>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  href="#produkty"
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-colors hover:bg-emerald-700"
                >
                  Objednať Boswellia gél
                </Link>
                <span className="flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-emerald-700 shadow-sm ring-1 ring-emerald-100">
                  11,90 € • doručenie do 24 h
                </span>
              </div>
              <div className="grid gap-3 pt-6 sm:grid-cols-3">
                {highlightStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-emerald-100 bg-white/70 px-4 py-3 text-center shadow-sm backdrop-blur"
                  >
                    <div className="text-2xl font-semibold text-emerald-700">{stat.value}</div>
                    <div className="text-xs font-medium uppercase tracking-wide text-emerald-800/70">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-sm md:max-w-md">
              <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-emerald-200/40 blur-3xl" />
              <div className="relative overflow-hidden rounded-[3rem] border border-emerald-100 bg-white/80 p-6 shadow-2xl backdrop-blur">
                <Image
                  src="/images/ingredients/boswellia-serata.jpeg"
                  alt="Boswellia serrata gél nanášaný na koleno"
                  width={640}
                  height={800}
                  priority
                  className="w-full rounded-[2.5rem] object-cover shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl space-y-6 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Úľava pre tvoje kĺby, svaly a šľachy</h2>
            <p className="text-lg text-gray-600">
              Bylinný extrakt Boswellia serrata sa už stáročia využíva v ajurvédskej medicíne pre svoje
              protizápalové a regeneračné vlastnosti. V modernej forme gélu prináša rýchly účinok priamo na
              mieste, kde ho najviac potrebuješ.
            </p>
            <div className="mx-auto h-px w-16 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
            <div className="grid gap-4 md:grid-cols-2">
              {heroHighlights.map(({ title, description, icon: Icon }) => (
                <div
                  key={title}
                  className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-white px-5 py-4 shadow-sm"
                >
                  <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="text-left">
                    <h3 className="text-base font-semibold text-gray-900">{title}</h3>
                    <p className="text-sm text-gray-600">{description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid gap-4 pt-6 text-left sm:grid-cols-2">
              {benefits.map(({ label, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm"
                >
                  <span className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-gray-700">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-emerald-50/70 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl space-y-6 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Zloženie s účinnými látkami</h2>
            <p className="text-lg text-gray-600">
              Každá zložka v géle má svoj dôvod – spolu vytvárajú synergiu, ktorá podporuje komfort a
              regeneráciu kĺbov bez mastného pocitu na pokožke.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {ingredients.map(({ title, description, icon: Icon }) => (
              <article
                key={title}
                className="flex h-full flex-col gap-4 rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <Icon className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900">{title}</h3>
                  <p className="text-gray-600">{description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl space-y-6 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Ako používať Boswellia serrata gél</h2>
            <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
              <ol className="grid gap-6 text-left md:grid-cols-3">
                {usageSteps.map(({ title, description, icon: Icon }, index) => (
                  <li key={title} className="flex flex-col gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
                      {index + 1}
                    </span>
                    <div className="flex items-center gap-2 text-emerald-700">
                      <Icon className="h-5 w-5" />
                      <strong className="text-sm uppercase tracking-wide text-emerald-700">{title}</strong>
                    </div>
                    <p className="text-sm text-gray-600">{description}</p>
                  </li>
                ))}
              </ol>
            </div>
            <p className="text-sm text-gray-500">
              Tip: Pre extra úľavu ulož ošetrené miesto na pár minút do zvýšenej polohy – pomôžeš tak lepšiemu
              prekrveniu a regenerácii.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-emerald-900/5 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl space-y-6 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Kompletná starostlivosť o kĺby zvnútra aj zvonka</h2>
            <p className="text-lg text-gray-600">
              Z Boswellia serrata gélu spravíš ešte silnejší nástroj, keď ho zakomponuješ do rutiny a spojíš s
              ingredienciami, ktoré podporujú prirodzený regeneračný cyklus.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {synergyPoints.map((point) => (
              <article
                key={point.title}
                className="flex h-full flex-col gap-3 rounded-3xl border border-emerald-100 bg-white/80 p-6 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-lg"
              >
                <h3 className="text-lg font-semibold text-emerald-800">{point.title}</h3>
                <p className="text-sm text-gray-600">{point.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Products
        productIds={[669, 824, 684]}
        title="Boswellia serrata gél a výhodné balíčky"
        description="Vyber si samostatnú tubu gélu alebo zvýhodnené sety, ktoré kombinujú Boswelliu s kĺbovou výživou Joint Boost pre komplexný účinok zvnútra aj zvonka."
        gridClassName="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
        loadingGridClassName="animate-pulse grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      />

      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl space-y-8 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900">Pre koho je gél vhodný</h2>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
              <div className="grid gap-4 sm:grid-cols-2">
                {targetUsers.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white px-5 py-4 text-left shadow-sm"
                  >
                    <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg font-semibold text-emerald-700">
                      •
                    </span>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
              <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-500/90 via-emerald-600 to-emerald-700 p-8 text-left text-white shadow-lg">
                <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
                <h3 className="text-2xl font-semibold">Personalizovaná úľava</h3>
                <p className="mt-3 text-sm text-emerald-50/90">
                  Vďaka kombinácii bylinných extraktov, chladivých látok a regeneračných zložiek gél reaguje na
                  aktuálne potreby tvojich kĺbov – od rannej stuhnutosti až po regeneráciu po tréningu.
                </p>
                <p className="mt-4 text-sm font-medium">
                  Potrebuješ poradiť s rutinou?{' '}
                  <Link className="underline decoration-white/60 underline-offset-4" href="/kontakt">
                    Napíš nám a navrhneme ti ideálny postup
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
