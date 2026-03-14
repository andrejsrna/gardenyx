import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Activity, ArrowRight, Flame, Leaf, Shield, Snowflake } from 'lucide-react';
import CureBundlesSection from '../components/CureBundlesSection';

export const metadata: Metadata = {
  title: 'Masť na bolesť kolena – rýchla úľava a ochladenie | Joint Boost Gél',
  description:
    'Chladivá masť na bolesť kolena, ktorá zmierňuje pocit bolesti, napätia a stuhnutosti už po prvom použití. Rýchlo sa vstrebáva, nemastí a prináša úľavu do niekoľkých minút.',
  alternates: {
    canonical: 'https://najsilnejsiaklbovavyziva.sk/mast-na-bolest-kolena',
  },
  openGraph: {
    title: 'Masť na bolesť kolena – rýchla úľava a ochladenie | Joint Boost Gél',
    description:
      'Chladivá masť na bolesť kolena, ktorá zmierňuje pocit bolesti, napätia a stuhnutosti už po prvom použití. Rýchlo sa vstrebáva, nemastí a prináša úľavu do niekoľkých minút.',
    url: 'https://najsilnejsiaklbovavyziva.sk/mast-na-bolest-kolena',
    siteName: 'Najsilnejšia kĺbová výživa',
    locale: 'sk_SK',
    type: 'website',
    images: [
      {
        url: 'https://najsilnejsiaklbovavyziva.sk/jointboost-gel.jpg',
        width: 1200,
        height: 1200,
        alt: 'Masť na bolesť kolena Joint Boost Gél',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Masť na bolesť kolena – rýchla úľava a ochladenie | Joint Boost Gél',
    description:
      'Chladivá masť na bolesť kolena, ktorá zmierňuje pocit bolesti, napätia a stuhnutosti už po prvom použití. Rýchlo sa vstrebáva, nemastí a prináša úľavu do niekoľkých minút.',
    images: ['https://najsilnejsiaklbovavyziva.sk/jointboost-gel.jpg'],
  },
};

const heroBullets = [
  'Vhodné pri športových zraneniach, preťažení aj bežnej bolesti',
  'Rýchlo sa vstrebáva, nemastí',
  'Úľava do niekoľkých minút',
];

const painCauses = [
  'Preťaženie pri športe, schodoch alebo behu',
  'Dlhé sedenie a málo pohybu',
  'Zápal šliach a okolitých tkanív',
  'Stuhnutosť po ránu alebo po záťaži',
  'Namáhanie pri práci – kľačanie, zdvíhanie',
];

const reliefBenefits = [
  {
    title: 'Chladivý efekt mentolu a gáforu',
    description: 'Rýchlo zmierňuje pocit bolesti a napätia v kolene.',
    icon: Snowflake,
  },
  {
    title: 'MSM a arnika',
    description: 'Podporujú regeneráciu a revitalizáciu tkanív po záťaži.',
    icon: Leaf,
  },
  {
    title: 'Eukalyptus',
    description: 'Pomáha prekrviť a uvoľniť stuhnuté svaly okolo kolena.',
    icon: Flame,
  },
];

const audience = [
  'Športovci (beh, futbal, crossfit)',
  'Ľudia so sedavým zamestnaním',
  'Starostlivosť po náročnom dni',
  'Chronická stuhnutosť a obmedzený rozsah pohybu',
  'Seniori, ktorí chcú rýchlu úľavu',
];

const steps = [
  'Naneste malé množstvo gélu priamo na koleno.',
  'Jemne vmasírujte krúživými pohybmi.',
  'Opakujte 2–3× denne podľa potreby.',
  'Pre lepší efekt aplikujte po sprche alebo miernom zahriatí kolena.',
];

const ingredientIcons = [
  { title: 'MSM', description: 'Regenerácia a pružnosť tkanív', icon: Shield },
  { title: 'Arnika montana', description: 'Revitalizuje a osviežuje pokožku', icon: Leaf },
  { title: 'Mentol + gáfor', description: 'Intenzívny chladivý efekt', icon: Snowflake },
  { title: 'Eukalyptus', description: 'Uvoľnenie a lepšie prekrvenie', icon: Activity },
];

const whyPoints = [
  'Slovenský produkt',
  'Moderná receptúra bez mastenia',
  'Funguje pri bolesti kolena, chrbta aj ramena',
  'Rýchly účinok, výborná vstrebateľnosť',
  'Otestované stovkami zákazníkov',
];

const comparisonRows = [
  { regular: 'Mastí, lepí', jointBoost: 'Rýchlo sa vstrebáva' },
  { regular: 'Slabý chladivý účinok', jointBoost: 'Intenzívny mentol + gáfor' },
  { regular: 'Málo účinných látok', jointBoost: 'MSM + arnika + eukalyptus' },
  { regular: 'Umelé vône', jointBoost: 'Prírodné extrakty' },
];

const faqItems = [
  {
    question: 'Pomôže aj pri dlhotrvajúcej bolesti?',
    answer:
      'Áno, pravidelná aplikácia uľavuje od napätia a stuhnutosti. Pri pretrvávajúcej alebo zhoršujúcej sa bolesti odporúčame konzultáciu s odborníkom.',
  },
  {
    question: 'Môžem gél používať preventívne?',
    answer: 'Áno, aplikácia pred záťažou alebo po nej pomáha udržať koleno v komforte a podporuje regeneráciu.',
  },
  {
    question: 'Je vhodný aj pre seniorov?',
    answer: 'Áno, ľahká gélová textúra sa rýchlo vstrebáva a nezanecháva mastný film, takže je pohodlná na každodenné používanie.',
  },
  {
    question: 'Dá sa použiť pred športom?',
    answer: 'Áno, naneste tenkú vrstvu 15–20 minút pred aktivitou pre rýchly chladivý efekt.',
  },
  {
    question: 'Ako dlho trvá účinok?',
    answer: 'Chladivý pocit nastupuje do pár minút. Pri potrebe úľavy môžete aplikáciu zopakovať 2–3× denne.',
  },
];

export default function MastNaBolestKolenaPage() {
  return (
    <main className="bg-white">
      <section className="bg-gradient-to-br from-emerald-50 via-white to-emerald-100/60 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div className="space-y-6 text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                Masť na bolesť kolena • chladivý gél
              </span>
              <h1 className="text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
                Masť na bolesť kolena – rýchla úľava a okamžité ochladenie
              </h1>
              <p className="text-lg text-gray-600 md:text-xl">
                Chladivý gél, ktorý zmierňuje pocit bolesti, napätia a stuhnutosti kolena už po prvom použití.
                Rýchlo sa vstrebáva, nemastí a prinesie sviežosť do pár minút.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                {heroBullets.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-green-700 shadow-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  href="#produkty"
                  className="inline-flex items-center gap-2 rounded-full bg-green-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-colors hover:bg-green-700"
                >
                  Objednať Joint Boost Gél – 11,90 €
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <span className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-green-700 shadow-sm ring-1 ring-green-100">
                  Odosielame do 24 hodín
                </span>
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-sm md:max-w-md">
              <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-emerald-200/40 blur-3xl" />
              <div className="relative overflow-hidden rounded-[2.5rem] border border-green-100 bg-white/80 p-6 shadow-2xl backdrop-blur">
                <Image
                  src="/jointboost-gel.jpg"
                  alt="Masť na bolesť kolena nanášaná na koleno"
                  width={720}
                  height={600}
                  priority
                  className="w-full rounded-3xl object-cover shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl space-y-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Prečo vzniká bolesť kolena?</h2>
            <p className="text-lg text-gray-600">
              Najčastejšie ide o preťaženie, stuhnutosť alebo podráždenie okolitých tkanív. Pozri, čo koleno
              vyčerpáva najčastejšie. Ak hľadáš komplexnejšieho sprievodcu, mrkni na{' '}
              <Link className="text-emerald-700 hover:underline" href="/protizapalova-mast-na-klby">
                protizápalovú masť na kĺby
              </Link>
              :
            </p>
          </div>
          <div className="mt-10 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
            {painCauses.map((cause) => (
              <div
                key={cause}
                className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm"
              >
                <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg font-semibold text-emerald-700">
                  ✓
                </span>
                <span className="text-gray-700">{cause}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-sm font-semibold text-emerald-800 shadow-sm">
            ➡ Ak bolesť obmedzuje pohyb alebo sa zhoršuje, navštívte odborníka.
          </div>
        </div>
      </section>

      <section className="bg-emerald-50/60 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl space-y-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Ako masť na koleno prináša úľavu</h2>
            <p className="text-lg text-gray-600">
              Účinok pocítiš do niekoľkých minút od aplikácie. Viac o jednotlivých látkach nájdeš na podstránkach{' '}
              <Link className="text-emerald-700 hover:underline" href="/protizapalova-mast-na-klby/zlozky/mentol-a-gafor-gel">
                mentol + gáfor
              </Link>
              ,{' '}
              <Link className="text-emerald-700 hover:underline" href="/protizapalova-mast-na-klby/zlozky/msm-gel">
                MSM
              </Link>{' '}
              a{' '}
              <Link className="text-emerald-700 hover:underline" href="/protizapalova-mast-na-klby/zlozky/arnika-montana-gel">
                arnika montana
              </Link>
              .
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {reliefBenefits.map(({ title, description, icon: Icon }) => (
              <article
                key={title}
                className="h-full rounded-3xl border border-emerald-100 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                <p className="mt-2 text-gray-600">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl space-y-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Keď ti koleno dáva najavo, že má dosť</h2>
            <p className="text-lg text-gray-600">
              Chladivá masť na koleno je praktická vo viacerých situáciách.
            </p>
          </div>
          <div className="mt-10 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
            {audience.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm"
              >
                <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg font-semibold text-emerald-700">
                  •
                </span>
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center text-sm font-semibold text-emerald-700">
            <Link className="inline-flex items-center gap-2 hover:underline" href="/protizapalova-mast-na-klby#klucove-zlozky">
              Zisti viac o účinných látkach
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl space-y-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Ako správne používať masť na bolesť kolena</h2>
            <p className="text-lg text-gray-600">
              Nemastí, nezanecháva lepivý film, vhodné aj pred športom. Podrobný návod nájdeš aj v sekcii{' '}
              <Link className="text-emerald-700 hover:underline" href="/uzivanie">
                Ako užívať Joint Boost
              </Link>
              .
            </p>
          </div>
          <ol className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <li
                key={step}
                className="h-full rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4 text-left shadow-sm"
              >
                <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
                  {index + 1}
                </div>
                <p className="text-gray-700">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-emerald-50/60 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl space-y-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Prírodné látky s okamžitým účinkom</h2>
            <p className="text-lg text-gray-600">Kombinácia chladenia, regenerácie a príjemnej vône.</p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {ingredientIcons.map(({ title, description, icon: Icon }) => (
              <article
                key={title}
                className="h-full rounded-3xl border border-emerald-100 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm text-gray-600">{description}</p>
              </article>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/protizapalova-mast-na-klby#klucove-zlozky"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-200 px-5 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
            >
              Pozrieť celé zloženie
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl space-y-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Prečo práve Joint Boost Gél?</h2>
            <p className="text-lg text-gray-600">Spoľahlivá voľba pri bolesti kolena, chrbta aj ramena.</p>
          </div>
          <div className="mt-10 grid gap-4 text-left sm:grid-cols-2">
            {whyPoints.map((point) => (
              <div
                key={point}
                className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm"
              >
                <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg font-semibold text-emerald-700">
                  ✓
                </span>
                <span className="text-gray-700">{point}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center text-sm font-semibold text-emerald-700">
            <span className="block">Najpredávanejšia masť v kategórii chladivých gélov 2025</span>
            <Link
              className="mt-2 inline-flex items-center gap-2 text-emerald-700 hover:underline"
              href="/joint-boost"
            >
              Pozri aj kapsule Joint Boost
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-emerald-900/5 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl space-y-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Ako si stojí v porovnaní s bežnými masťami</h2>
          </div>
          <div className="mx-auto mt-10 max-w-4xl overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-lg">
            <div className="grid grid-cols-2 bg-emerald-50 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-emerald-800">
              <div>Bežná masť</div>
              <div>Joint Boost Gél</div>
            </div>
            <div className="divide-y divide-emerald-50">
              {comparisonRows.map((row) => (
                <div key={row.regular} className="grid grid-cols-2 px-4 py-3 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                      –
                    </span>
                    {row.regular}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                      +
                    </span>
                    {row.jointBoost}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl space-y-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Najčastejšie otázky o masti na koleno</h2>
            <p className="text-lg text-gray-600">Krátke odpovede, aby si vedel, kedy gél použiť.</p>
          </div>
          <div className="mx-auto mt-10 max-w-3xl space-y-4">
            {faqItems.map((item) => (
              <details
                key={item.question}
                className="group rounded-2xl border border-gray-100 bg-white px-6 py-5 shadow-sm transition"
              >
                <summary className="flex cursor-pointer items-center justify-between text-left text-lg font-semibold text-gray-900">
                  {item.question}
                  <span className="ml-4 text-2xl text-green-600 transition-transform group-open:rotate-45">+</span>
                </summary>
                <div className="mt-3 text-gray-700">{item.answer}</div>
              </details>
            ))}
          </div>
          <div className="mt-8 text-center text-sm text-gray-700">
            Ďalšie otázky? Pozri{' '}
            <Link className="text-emerald-700 hover:underline" href="/casto-kladene-otazky">
              FAQ k Joint Boost
            </Link>{' '}
            alebo nám napíš cez{' '}
            <Link className="text-emerald-700 hover:underline" href="/kontakt">
              kontakt
            </Link>
            .
          </div>
        </div>
      </section>

      <CureBundlesSection buttonText="Zobraziť všetky produkty" />
    </main>
  );
}
