import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import Products from '../components/landing-page/Products';

export const metadata: Metadata = {
  title: 'Protizápalová masť na kĺby – rýchla úľava a regenerácia',
  description:
    'Chladivá protizápalová masť na kĺby pre okamžitú úľavu od napätia, stuhnutosti a bolesti po záťaži. Rýchlo sa vstrebáva, nezanecháva mastný film a podporuje regeneráciu.',
};

const heroHighlights = [
  'Okamžitá úľava od napätia a stuhnutosti',
  'Vhodná pri akútnej bolesti aj po fyzickej záťaži',
  'Rýchlo sa vstrebáva – bez mastného filmu na pokožke',
];

const benefitBullets = [
  'Zmierňuje pocit napätia a stuhnutosti',
  'Podporuje regeneráciu kĺbov a svalov',
  'Osviežuje a zlepšuje prekrvenie',
  'Rýchlo sa vstrebáva, bez mastného filmu',
];

const usageSituations = [
  {
    title: 'Pri rannom rozcvičení',
    description:
      'Pomáha uvoľniť stuhnuté kĺby a pripraviť ich na pohyb hneď po prebudení alebo pred tréningom.',
  },
  {
    title: 'Po športovej záťaži',
    description:
      'Chladivý efekt uľaví preťaženým kĺbom a svalom a podporí ich rýchlejšie zotavenie po výkone.',
  },
  {
    title: 'Pri chronickej bolesti',
    description:
      'Pravidelná lokálna aplikácia pomáha udržiavať kĺby pod kontrolou a spríjemňuje každodenný pohyb.',
  },
];

const coreEffects = [
  {
    title: 'Cielené pôsobenie priamo na kĺb',
    description:
      'Aplikácia na postihnuté miesto prináša úľavu presne tam, kde ju potrebuješ – bez zaťaženia tráviaceho systému.',
  },
  {
    title: 'Chladivý aj relaxačný efekt',
    description:
      'Masť osviežuje pokožku, znižuje pocit pálenia a podporuje lepšie prekrvenie okolitého tkaniva.',
  },
  {
    title: 'Podpora regenerácie po každom pohybe',
    description:
      'Pomáha obnoviť pružnosť kĺbov a svalov, aby si sa mohol rýchlejšie vrátiť k obľúbeným aktivitám.',
  },
];

type KeyIngredient = {
  title: string;
  description: string;
  image: string | null;
  href?: string;
};

const keyIngredients: KeyIngredient[] = [
  {
    title: 'MSM',
    description: 'Podporuje pružnosť kĺbov a regeneráciu tkanív.',
    image: '/images/ingredients/msm.jpeg',
  },
  {
    title: 'Arnika montana extrakt',
    description: 'Prispieva k revitalizácii a regenerácii pokožky.',
    image: null,
    href: '/protizapalova-mast-na-klby/zlozky/arnika-montana-gel',
  },
  {
    title: 'Boswellia serrata extrakt',
    description: 'Podporuje prirodzenú pohyblivosť kĺbov.',
    image: '/images/ingredients/boswellia-serata.jpeg',
    href: '/protizapalova-mast-na-klby/zlozky/boswellia-serrata-gel',
  },
  {
    title: 'Mentol a gáfor',
    description: 'Prinášajú okamžitý chladivý efekt a pocit úľavy.',
    image: null,
  },
  {
    title: 'Glukozamín a chondroitín',
    description: 'Pomáhajú udržiavať zdravú chrupavku.',
    image: '/images/ingredients/glukozamin.jpeg',
  },
  {
    title: 'Prírodné oleje a emolienty',
    description: 'Zabezpečujú dobrú vstrebateľnosť bez mastného pocitu.',
    image: null,
  },
];

const getIngredientInitials = (value: string): string => {
  if (!value) return '';
  const initials = value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase())
    .join('');
  return initials.slice(0, 2);
};

const applicationSteps = [
  {
    label: '1. Aplikuj na čistú pokožku',
    description:
      'Nanášaj malé množstvo gélu na suchú pokožku bez otvorených rán alebo podráždenia.',
  },
  {
    label: '2. Vmasíruj krúživými pohybmi',
    description: 'Masíruj jemne, kým sa gél úplne nevstrebe a miesto sa príjemne neochladí.',
  },
  {
    label: '3. Opakuj podľa potreby',
    description:
      'Pri akútnej bolesti 2–3× denne. Pri chronických ťažkostiach kombinuj s výživou kĺbov zvnútra.',
  },
];

const faqItems: { question: string; answer: ReactNode }[] = [
  {
    question: 'Ako často môžem masť používať?',
    answer:
      'Podľa potreby až 3-krát denne. Pri citlivej pokožke odporúčame najskôr vyskúšať menšie množstvo.',
  },
  {
    question: 'Je masť vhodná aj pri dlhodobých problémoch s kĺbmi?',
    answer:
      'Áno, pravidelná aplikácia pomáha udržiavať kĺby bez stuhnutosti. Pre komplexnú starostlivosť ju kombinuj s vnútornou výživou, napríklad doplnkom Joint Boost.',
  },
  {
    question: 'Môžem masť používať aj po operácii alebo úraze?',
    answer:
      'Po konzultácii s lekárom. Masť nepoužívaj na čerstvé rany, stehy a zapálenú pokožku. Na jazvy ju aplikuj až po úplnom zahojení.',
  },
  {
    question: 'Pozorujem mierne teplo po aplikácii – je to v poriadku?',
    answer:
      'Áno, krátkodobé teplo alebo chlad je prirodzená reakcia na účinné látky. Pri nepríjemnom pálení masť zmy a aplikuj menšie množstvo.',
  },
];

export default function ProtizapalovyGelPage() {
  return (
    <main className="bg-white">
      <section className="bg-gradient-to-br from-emerald-50 via-white to-slate-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div className="space-y-6 text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                Protizápalová starostlivosť • okamžitá úľava • lokálna aplikácia
              </span>
              <h1 className="text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
                Protizápalová masť na kĺby – rýchle ochladenie a regenerácia
              </h1>
              <p className="text-lg text-gray-600 md:text-xl">
                Chladivý gél, ktorý uľaví unaveným a stuhnutým kĺbom už po prvom nanesení. Ideálny pri
                bolestiach kolien, ramien a drobných kĺbov, po športe aj pri dlhodobom preťažení.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                {heroHighlights.map((highlight) => (
                  <span
                    key={highlight}
                    className="rounded-full border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-green-700 shadow-sm"
                  >
                    {highlight}
                  </span>
                ))}
              </div>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  href="#produkty"
                  className="inline-flex items-center gap-2 rounded-full bg-green-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-colors hover:bg-green-700"
                >
                  Pozri produkty
                </Link>
                <Link
                  href="/kupit"
                  className="inline-flex items-center gap-2 rounded-full border border-green-200 px-6 py-3 text-sm font-semibold text-green-700 transition-colors hover:border-green-300 hover:text-green-800"
                >
                  Kompletná starostlivosť o kĺby
                </Link>
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-sm md:max-w-md">
              <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-emerald-200/40 blur-3xl" />
              <div className="relative overflow-hidden rounded-[2.5rem] border border-green-100 bg-white/80 p-6 shadow-2xl backdrop-blur">
                <Image
                  src="/jointboost-gel.jpg"
                  alt="Protizápalová masť nanášaná na koleno"
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

      <section id="co-je" className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl space-y-6 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Čo pomáha protizápalová masť na kĺby?</h2>
            <p className="text-lg text-gray-600">
              Lokálna starostlivosť pre všetkých, ktorí cítia stuhnutosť, napätie alebo bolesť pri pohybe.
              Ideálna po fyzickej záťaži, športovaní aj pri sedavej práci, keď sa kĺby ozývajú častejšie
              ako by si chcel.
            </p>
            <ul className="grid gap-4 text-left sm:grid-cols-2">
              {benefitBullets.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm"
                >
                  <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-lg font-semibold text-green-700">
                    ✓
                  </span>
                  <span className="text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="pre-koho" className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl space-y-6 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Kedy siahnuť po géle</h2>
            <p className="text-lg text-gray-600">
              Protizápalová masť ti dáva flexibilitu – namieňaj ju do svojej rutiny vždy, keď kĺby
              potrebujú extra pozornosť.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {usageSituations.map((item) => (
              <article
                key={item.title}
                className="h-full rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm"
              >
                <h3 className="mb-3 text-xl font-semibold text-gray-900">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="ako-funguje" className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl space-y-6 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Ako masť funguje</h2>
            <p className="text-lg text-gray-600">
              Spojenie protizápalového účinku, chladivého pocitu a masáže podporuje prirodzenú regeneráciu
              kĺbov aj svalov.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {coreEffects.map((effect) => (
              <article
                key={effect.title}
                className="h-full rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <h3 className="mb-3 text-xl font-semibold text-gray-900">{effect.title}</h3>
                <p className="text-gray-600">{effect.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="klucove-zlozky" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl space-y-6 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Kľúčové aktívne zložky</h2>
            <p className="text-lg text-gray-600">
              Kombinácia prírodných extraktov a osvedčených látok prináša okamžitú úľavu aj dlhodobú podporu
              regenerácie kĺbov.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {keyIngredients.map((ingredient) => (
              <article
                key={ingredient.title}
                className="group h-full overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-44 w-full overflow-hidden bg-emerald-50">
                  {ingredient.image ? (
                    <Image
                      src={ingredient.image}
                      alt={ingredient.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 45vw, 100vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-100 via-white to-emerald-50">
                      <span className="text-3xl font-bold text-emerald-600">
                        {getIngredientInitials(ingredient.title)}
                      </span>
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-emerald-900/30 via-transparent to-transparent" />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <span className="inline-flex w-fit items-center justify-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    Aktívna zložka
                  </span>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {ingredient.href ? (
                      <Link
                        href={ingredient.href}
                        className="transition-colors hover:text-emerald-700 hover:underline"
                      >
                        {ingredient.title}
                      </Link>
                    ) : (
                      ingredient.title
                    )}
                  </h3>
                  <p className="text-gray-600">{ingredient.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="ako-pouzivat" className="bg-green-50/60 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl space-y-6 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Ako správne používať protizápalovú masť</h2>
            <p className="text-lg text-gray-600">
              Trvaj na pravidelnosti a kombinuj masť so šetrným pohybom a dostatočným pitným režimom.
            </p>
          </div>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {applicationSteps.map((step) => (
              <li
                key={step.label}
                className="h-full rounded-2xl border border-green-100 bg-white p-6 shadow-sm"
              >
                <strong className="mb-2 block text-lg font-semibold text-green-700">{step.label}</strong>
                <span className="text-gray-700">{step.description}</span>
              </li>
            ))}
          </ol>
          <p className="mt-10 text-center text-base text-gray-600">
            Tip: Kombinuj lokálnu masť s vnútornou výživou kĺbov, napríklad doplnkom{' '}
            <Link className="text-green-600 hover:underline" href="/joint-boost">
              Joint Boost
            </Link>
            , pre komplexnú regeneráciu.
          </p>
        </div>
      </section>

      <Products
        productIds={[669, 824, 684]}
        title="Protizápalová masť a výhodné balíčky"
        description="Vyber si samostatnú masť alebo siahnite po zvýhodnených setoch, ktoré kombinujú gél s výživou Joint Boost pre intenzívnu starostlivosť o kĺby zvnútra aj zvonka."
        gridClassName="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
        loadingGridClassName="animate-pulse grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      />

      <section id="faq" className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl space-y-6 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Najčastejšie otázky</h2>
            <p className="text-lg text-gray-600">
              Ak máš ďalšie otázky, napíš nám{' '}
              <Link className="text-green-600 hover:underline" href="/kontakt">
                cez kontaktný formulár
              </Link>
              . Radi poradíme.
            </p>
          </div>
          <div className="mx-auto mt-10 max-w-3xl space-y-4">
            {faqItems.map((item) => (
              <details
                key={item.question}
                className="group rounded-2xl border border-gray-100 bg-white px-6 py-5 shadow-sm transition"
              >
                <summary className="flex cursor-pointer items-center justify-between text-left text-lg font-semibold text-gray-900">
                  {item.question}
                  <span className="ml-4 text-2xl text-green-600 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="mt-3 text-gray-700">{item.answer}</div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
