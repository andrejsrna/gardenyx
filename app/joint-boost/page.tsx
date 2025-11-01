import type { ReactNode } from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Comparsion from '../components/landing-page/Comparsion';
import Products from '../components/landing-page/Products';

export const metadata: Metadata = {
  title: 'Joint Boost – najkomplexnejšia výživa pre kĺby, šľachy a väzy',
  description:
    'Objav Joint Boost – doplnok s 9 účinnými látkami (glukozamín, chondroitín, MSM, kolagén, vitamín C, kurkumín, Boswellia, kyselina hyalurónová, BioPerine). Regenerácia, pohyblivosť a úľava pre tvoje kĺby.',
};

const reasons = [
  '1 kapsula denne',
  'vedecky overené zložky',
  'ideálne dávky pre každodenné užívanie',
  'HPMC kapsula – bez želatíny a plnív',
];

const ingredients = [
  {
    title: 'Glukozamín HCl – základná stavebná látka chrupavky',
    description: 'Podporuje regeneráciu kĺbovej chrupavky a zlepšuje pružnosť kĺbov.',
    links: [{ label: 'Viac o glukozamíne', href: '/zlozenie/glukozamin' }],
  },
  {
    title: 'Chondroitín sulfát – regenerácia a tlmenie bolesti',
    description: 'Pomáha zadržiavať vodu v chrupavke a udržiavať jej štruktúru.',
    links: [{ label: 'Viac o chondroitíne', href: '/zlozenie/chondroitin' }],
  },
  {
    title: 'MSM – síra pre pružné a odolné kĺby',
    description: 'Znižuje zápal a bolesť, zlepšuje vstrebávanie ostatných látok.',
    links: [{ label: 'Viac o MSM', href: '/zlozenie/msm' }],
  },
  {
    title: 'Kolagén typ II + Vitamín C',
    description:
      'Kolagén je hlavná stavebná bielkovina chrupavky. Vitamín C podporuje jeho tvorbu a vstrebávanie.',
    links: [
      { label: 'Viac o kolagéne', href: '/zlozenie/kolagen' },
      { label: 'Viac o vitamíne C', href: '/zlozenie/vitamin-c' },
    ],
  },
  {
    title: 'Kurkumín + Boswellia Serrata – prírodné protizápalové duo',
    description: 'Pomáhajú tlmiť zápal, znižovať bolesť a zlepšujú pohyblivosť.',
    links: [
      { label: 'Viac o kurkume', href: '/zlozenie/kurkuma' },
      { label: 'Viac o Boswellii', href: '/zlozenie/boswellia' },
    ],
  },
  {
    title: 'Kyselina hyalurónová – hydratácia a „mazivo“ pre kĺby',
    description: 'Zlepšuje pohyblivosť a znižuje trenie v kĺboch.',
    links: [{ label: 'Viac o kyseline hyalurónovej', href: '/zlozenie/kyselina-hyaluronova' }],
  },
  {
    title: 'BioPerine – zvyšuje vstrebateľnosť',
    description: 'Zvyšuje biologickú dostupnosť kurkumínu a vitamínu C.',
    links: [{ label: 'Viac o BioPerine (čierne korenie)', href: '/zlozenie/cierne-korenie' }],
  },
];

const timelinePoints: { label: string; description: ReactNode }[] = [
  {
    label: 'Prvé výsledky:',
    description: 'po 2–4 týždňoch pravidelného užívania',
  },
  {
    label: 'Pri chronických ťažkostiach:',
    description: 'odporúčané užívať min. 2 mesiace',
  },
  {
    label: 'Podpor:',
    description: (
      <>
        dostatok pohybu,{' '}
        <Link className="text-green-600 hover:underline" href="/protizapalova-strava">
          protizápalová strava
        </Link>{' '}
        a hydratácia
      </>
    ),
  },
];

const faqItems: { question: string; answer: ReactNode }[] = [
  {
    question: 'Ako dlho môžem užívať Joint Boost?',
    answer: 'Dlhodobo, bez prestávky. Je bezpečný a bez vedľajších účinkov.',
  },
  {
    question: 'Pomôže aj pri artróze kolena?',
    answer: (
      <>
        Áno – účinné látky podporujú regeneráciu chrupavky a tlmia zápal.{' '}
        <Link
          className="text-green-600 hover:underline"
          href="/co-je-artroza-7-dolezitych-informacii"
        >
          Čo je artróza – 7 dôležitých informácií
        </Link>
      </>
    ),
  },
  {
    question: 'Dá sa kombinovať s liekmi?',
    answer: 'Áno, no pri antikoagulanciách odporúčame konzultovať s lekárom.',
  },
  {
    question: 'Môžem ho užívať po operácii menisku alebo artroskopii?',
    answer: (
      <>
        Áno – pomáha urýchliť regeneráciu po zákrokoch.{' '}
        <Link className="text-green-600 hover:underline" href="/operacia-menisku">
          Operácia menisku – ako prebieha a čo očakávať
        </Link>
      </>
    ),
  },
];

const reviews = [
  {
    quote:
      'Po mesiaci užívania Joint Boostu ma prestali bolieť kolená pri chôdzi po schodoch. Určite odporúčam.',
    author: 'Mária, 46 rokov',
  },
  {
    quote: 'Skvelé zloženie, jednoduché užívanie. Cítim rozdiel po 3 týždňoch.',
    author: 'Peter, 38 rokov',
  },
];

export default function JointBoostPage() {
  return (
    <main className="bg-white">
      <section className="py-16 md:py-24 bg-gradient-to-br from-green-50 via-white to-emerald-50/30">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <div className="space-y-6 text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                9 účinných látok • doručenie do 24 h • bez želatíny
              </span>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900">
                Joint Boost – najkomplexnejšia výživa pre kĺby, šľachy a väzy
              </h1>
              <p className="text-lg md:text-xl text-gray-600">
                Jedna kapsula denne s kompletnou dávkou glukozamínu, chondroitínu, MSM, kolagénu,
                vitamínu C a rastlinných extraktov pre pružné a bezbolestné kĺby.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <span className="rounded-full border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-green-700 shadow-sm">
                  1 kapsula denne
                </span>
                <span className="rounded-full border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-green-700 shadow-sm">
                  HPMC kapsula bez želatíny
                </span>
                <span className="rounded-full border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-green-700 shadow-sm">
                  Vedecky overené zložky
                </span>
              </div>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  href="/kupit"
                  className="inline-flex items-center gap-2 rounded-full bg-green-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-colors hover:bg-green-700"
                >
                  Kúpiť teraz
                </Link>
                <Link
                  href="/zlozenie"
                  className="inline-flex items-center gap-2 rounded-full border border-green-200 px-6 py-3 text-sm font-semibold text-green-700 transition-colors hover:border-green-300 hover:text-green-800"
                >
                  Pozri kompletné zloženie
                </Link>
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-sm md:max-w-md">
              <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-emerald-200/40 blur-3xl" />
              <div className="relative overflow-hidden rounded-[2.5rem] border border-green-100 bg-white/80 p-6 shadow-2xl backdrop-blur">
                <Image
                  src="/product-image.png"
                  alt="Produkt Joint Boost"
                  width={720}
                  height={900}
                  priority
                  className="w-full rounded-3xl object-cover shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="preco" className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Prečo práve Joint Boost?</h2>
            <p className="text-lg text-gray-600">
              Kĺby sa denne opotrebúvajú – pohybom, sedením aj športom. Joint Boost vznikol pre
              ľudí, ktorí chcú kĺbom dodať všetko, čo potrebujú pre regeneráciu a pružnosť – bez
              zbytočných prísad a marketingových trikov.
            </p>
            <ul className="grid grid-cols-1 gap-4 text-left sm:grid-cols-2">
              {reasons.map((reason) => (
                <li
                  key={reason}
                  className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-700 font-semibold">
                    ✓
                  </span>
                  <span className="text-gray-700">{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="zlozenie" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">Zloženie a účinky jednotlivých látok</h2>
            <p className="text-lg text-gray-600">
              Každá kapsula Joint Boostu spája 9 synergických látok, ktoré podporujú regeneráciu
              kĺbov, znižujú zápal a zlepšujú pohyblivosť.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {ingredients.map((ingredient) => (
              <article
                key={ingredient.title}
                className="h-full rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <h3 className="mb-3 text-xl font-semibold text-gray-900">{ingredient.title}</h3>
                <p className="mb-4 text-gray-600">{ingredient.description}</p>
                <div className="flex flex-wrap gap-3 text-sm font-medium text-green-700">
                  {ingredient.links.map((link) => (
                    <Link key={link.href} href={link.href} className="hover:underline">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div id="porovnanie">
        <Comparsion />
      </div>

      <section id="kedy-ucitok" className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Kedy pocítiš účinok?</h2>
            <ul className="space-y-4 text-left text-lg text-gray-700">
              {timelinePoints.map((point) => (
                <li
                  key={point.label}
                  className="rounded-2xl border border-gray-100 bg-white px-6 py-5 shadow-sm"
                >
                  <strong className="block text-gray-900">{point.label}</strong>
                  <span className="text-gray-700">{point.description}</span>
                </li>
              ))}
            </ul>
            <p className="text-lg text-gray-700">
              Tipy:{' '}
              <Link className="text-green-600 hover:underline" href="/ako-sa-starat-o-svoje-klby-v-kazdom-veku">
                Ako sa starať o svoje kĺby v každom veku
              </Link>
            </p>
          </div>
        </div>
      </section>

      <Products />

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-center text-gray-900">Recenzie zákazníkov</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {reviews.map((review) => (
                <figure
                  key={review.author}
                  className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
                >
                  <blockquote className="mb-4 flex-1 text-lg italic text-gray-700">
                    &ldquo;{review.quote}&rdquo;
                  </blockquote>
                  <figcaption className="text-sm font-semibold text-gray-900">
                    {review.author}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl space-y-6 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Často kladené otázky</h2>
            <div className="space-y-6 text-left">
              {faqItems.map((item) => (
                <div
                  key={item.question}
                  className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
                >
                  <h3 className="mb-3 text-xl font-semibold text-gray-900">{item.question}</h3>
                  <div className="text-gray-700">{item.answer}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl border border-green-100 bg-gradient-to-br from-green-600 via-green-600 to-emerald-700 shadow-2xl">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
            <div className="relative px-6 py-12 md:px-12 md:py-16">
              <div className="mx-auto max-w-3xl text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  Objednaj si Joint Boost
                </h2>
                <p className="text-green-50 text-lg mb-10">
                  Jednoduchá cesta k pružným a zdravým kĺbom
                </p>
                
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-10">
                  <div className="flex flex-col items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-5">
                    <svg className="w-10 h-10 text-green-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-white font-semibold text-center">Komplexná výživa pre kĺby, šľachy a väzy</span>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-5">
                    <svg className="w-10 h-10 text-green-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-white font-semibold text-center">1 kapsula denne</span>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-5 sm:col-span-2 lg:col-span-1">
                    <svg className="w-10 h-10 text-green-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    <span className="text-white font-semibold text-center">9 účinných látok v ideálnych dávkach</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-6 mb-8 text-white/90">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-medium">Doručenie do 24 hodín</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-medium">14 dní na vrátenie</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-medium">Bez lepku, želatíny a cukru</span>
                  </div>
                </div>

                <Link
                  href="/kupit"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-10 py-4 text-lg font-bold text-green-600 shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
                >
                  <span>Objednať teraz</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
