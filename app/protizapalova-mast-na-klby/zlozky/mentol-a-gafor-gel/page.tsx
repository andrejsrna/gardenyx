import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Products from '../../../components/landing-page/Products';

export const metadata: Metadata = {
  title: 'Mentolový a gáforový gél – okamžité osvieženie pre kĺby',
  description:
    'Mentolový a gáforový gél prináša okamžitý chladivý efekt, uvoľňuje stuhnuté kĺby a svaly a zvyšuje vstrebávanie ďalších aktívnych látok v Najsilnejšom kĺbovom géle.',
};

const benefits = [
  'Prinášajú okamžitý chladivý efekt a pocit úľavy.',
  'Podporujú prekrvenie a uvoľňujú svalové napätie.',
  'Pomáhajú zmierniť pocit stuhnutosti a únavy.',
  'Zvyšujú vstrebávanie ďalších aktívnych látok (MSM, arnika, Boswellia).',
  'Osviežujú po tréningu alebo dlhom dni v pohybe.',
];

const synergyHighlights = [
  'Chladí, regeneruje a uvoľňuje namáhané časti tela.',
  'Pomáha znižovať pocit napätia a ťažoby.',
  'Prináša dlhodobý pocit sviežosti a komfortu bez mastného filmu.',
];

const usageTips = [
  'Po športovom výkone alebo fyzickej záťaži.',
  'Pri svalovej únave a stuhnutosti kĺbov.',
  'Na uvoľnenie napätia v oblasti chrbta, ramien či kolien.',
  'Na osvieženie počas teplých dní alebo po sprche.',
];

export default function MentolGaforGelPage() {
  return (
    <main className="bg-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-emerald-100/40 py-16 md:py-24">
        <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent)] md:block" />
        <div className="container relative mx-auto px-4">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div className="space-y-6 text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                ❄️ Mentol & gáfor gél
              </span>
              <h1 className="text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
                Mentolový a gáforový gél – okamžité osvieženie a úľava pre kĺby a svaly
              </h1>
              <p className="text-lg text-gray-600 md:text-xl">
                Kombinácia mentolu a gáforu patrí medzi najobľúbenejšie prírodné riešenia pri lokálnej starostlivosti
                o kĺby. Prináša intenzívny chladivý efekt, podporuje prekrvenie pokožky a pomáha uvoľniť napäté svaly
                bez mastného pocitu.
              </p>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  href="#produkty"
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-colors hover:bg-emerald-700"
                >
                  Objednať chladivý gél
                </Link>
                <span className="flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-emerald-700 shadow-sm ring-1 ring-emerald-100">
                  11,90 € • doručenie do 24 h
                </span>
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-sm md:max-w-md">
              <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-emerald-200/40 blur-3xl" />
              <div className="relative overflow-hidden rounded-[3rem] border border-emerald-100 bg-white/80 p-6 shadow-2xl backdrop-blur">
                <Image
                  src="/jointboost-gel.jpg"
                  alt="Mentolový a gáforový gél aplikovaný na koleno"
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
            <h2 className="text-3xl font-bold text-gray-900">Čo je mentol a gáfor?</h2>
            <p className="text-lg text-gray-600">
              Mentol a gáfor patria medzi najznámejšie prírodné zložky využívané v kozmetike a rehabilitačných
              prípravkoch. V modernom Najsilnejšom kĺbovom géle vytvárajú rýchlo pôsobiaci chladivý efekt, ktorý
              prináša úľavu, sviežosť a podporuje prekrvenie pokožky.
            </p>
          </div>
          <div className="mt-10 grid gap-4 text-left sm:grid-cols-2">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm"
              >
                <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg font-semibold text-emerald-700">
                  ✓
                </span>
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-emerald-50/70 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl space-y-6 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Mentol a gáfor v Najsilnejšom kĺbovom géle</h2>
            <p className="text-lg text-gray-600">
              Naša receptúra využíva optimálny pomer mentolu a gáforu spolu s MSM,{' '}
              <Link className="text-emerald-600 hover:underline" href="/protizapalova-mast-na-klby/zlozky/arnika-montana-gel">
                arnikou montana
              </Link>{' '}
              a Boswelliou serrata.
              Vďaka tomu gél:
            </p>
          </div>
          <div className="mt-10 grid gap-4 text-left sm:grid-cols-2">
            {synergyHighlights.map((highlight) => (
              <div
                key={highlight}
                className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm"
              >
                <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg font-semibold text-emerald-700">
                  •
                </span>
                <span className="text-gray-700">{highlight}</span>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-base text-gray-600">
            Pri detailnej regenerácii kĺbov sa mentol s gáforom skvele dopĺňajú s{' '}
            <Link className="text-emerald-600 hover:underline" href="/protizapalova-mast-na-klby/zlozky/glukozamin-a-chondroitin-gel">
              glukozamínovo-chondroitínovým gélom
            </Link>
            , ktorý cieli na dlhodobú výživu chrupaviek.
          </p>
          <p className="mt-10 text-center text-base text-gray-600">
            Ideálne riešenie pre športovcov, fyzicky aktívnych ľudí aj tých, ktorí trpia stuhnutosťou pri sedavom
            zamestnaní.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl space-y-6 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Kedy používať mentolový a gáforový gél</h2>
          </div>
          <div className="mt-10 grid gap-4 text-left sm:grid-cols-2">
            {usageTips.map((tip) => (
              <div
                key={tip}
                className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm"
              >
                <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg font-semibold text-emerald-700">
                  ⏱
                </span>
                <span className="text-gray-700">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl space-y-6 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Prečo siahnuť po mentolovom géle?</h2>
            <p className="text-lg text-gray-600">
              Mentol a gáfor pôsobia rýchlo, lokálne a bez vedľajších účinkov. Aktivujú prirodzené regeneračné procesy
              pokožky a svalov, prinášajú okamžitú sviežosť a uvoľňujú aj hlbšie uložené napätie.
            </p>
            <p className="text-base text-gray-600">
              V kombinácii s ďalšími účinnými látkami predstavujú dokonalé spojenie chladenia, úľavy a revitalizácie –
              presne to, čo potrebuješ pri namáhaných kĺboch.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="#produkty"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-emerald-700"
              >
                🛒 Vyskúšaj Najsilnejší kĺbový gél
              </Link>
              <div className="rounded-full bg-emerald-100 px-5 py-3 text-sm font-semibold text-emerald-700">
                Doručenie do 24 h • Doprava zdarma nad 40 €
              </div>
            </div>
          </div>
        </div>
      </section>

      <Products
        productIds={[669, 824, 684]}
        title="Najsilnejší kĺbový gél s mentolom a gáforom"
        description="Mentol + gáfor, MSM, arnika a Boswellia v jednom géle. Vyber si samostatné balenie alebo zvýhodnené sety pre komplexnú starostlivosť o kĺby."
        gridClassName="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
        loadingGridClassName="animate-pulse grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      />
    </main>
  );
}
