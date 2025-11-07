import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Products from '../../../components/landing-page/Products';

export const metadata: Metadata = {
  title: 'MSM gél – síra pre zdravé a pružné kĺby',
  description:
    'Zisti, ako MSM gél (metylsulfonylmetán) pomáha kĺbom, chrupavkám a svalom. Účinky, použitie a dôvody, prečo je MSM kľúčovou zložkou Najsilnejšieho kĺbového gélu.',
};

const benefits = [
  'Podporuje tvorbu kolagénu a elastínu v tkanivách',
  'Zlepšuje pohyblivosť a znižuje pocit stuhnutosti kĺbov',
  'Podporuje regeneráciu po fyzickej záťaži',
  'Prináša osviežujúci efekt a úľavu pri napätí',
  'Zlepšuje hydratáciu pokožky a vstrebávanie ďalších účinných látok',
];

const usageIdeas = [
  'Po športovej aktivite alebo fyzickej námahe',
  'Pri stuhnutosti krku, chrbta alebo kolien',
  'Po úrazoch a modrinách na podporu regenerácie',
  'Pri práci v stoji alebo sedavom zamestnaní',
  'Ako doplnok k výživovým doplnkom na kĺby, napríklad Joint Boost',
];

export default function MsmGelPage() {
  return (
    <main className="bg-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-emerald-100/40 py-16 md:py-24">
        <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent)] md:block" />
        <div className="container relative mx-auto px-4">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div className="space-y-6 text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                💎 MSM gél
              </span>
              <h1 className="text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
                MSM gél – síra pre zdravé, pružné a bezbolestné kĺby
              </h1>
              <p className="text-lg text-gray-600 md:text-xl">
                MSM (metylsulfonylmetán) je organická zlúčenina síry, ktorá sa prirodzene nachádza v ľudskom tele.
                Ako MSM gél alebo MSM masť sa používa pri lokálnej starostlivosti o namáhané kĺby a svaly – zlepšuje
                pružnosť, zmierňuje diskomfort a urýchľuje regeneráciu.
              </p>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  href="#produkty"
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-colors hover:bg-emerald-700"
                >
                  Objednať MSM gél
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
                  alt="MSM gél nanášaný na koleno"
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
            <h2 className="text-3xl font-bold text-gray-900">Čo je MSM?</h2>
            <p className="text-lg text-gray-600">
              MSM je jedna z najdôležitejších látok pre obnovu spojivových tkanív, chrupaviek, šliach a svalov. V
              kozmetike sa MSM gél využíva vďaka schopnosti preniknúť do pokožky, podporiť hydratáciu a pripraviť ju
              na vstrebávanie ďalších účinných látok. MSM na kĺby sa tak stáva praktickým pomocníkom vždy, keď potrebuješ
              lokálnu regeneráciu.
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
            <h2 className="text-3xl font-bold text-gray-900">MSM v Najsilnejšom kĺbovom géle</h2>
            <p className="text-lg text-gray-600">
              MSM je jednou z kľúčových zložiek nášho Najsilnejšieho kĺbového gélu. Spolu s{' '}
              <Link className="text-emerald-600 hover:underline" href="/protizapalova-mast-na-klby/zlozky/boswellia-serrata-gel">
                Boswellia serrata gélom
              </Link>{' '}
              a{' '}
              <Link className="text-emerald-600 hover:underline" href="/protizapalova-mast-na-klby/zlozky/arnika-montana-gel">
                arnikou montana
              </Link>{' '}
              dodáva protizápalovému gélu silu, ktorú cítiš okamžite – bez mastného filmu a s rýchlym vstrebávaním.
            </p>
            <p className="text-base text-gray-600">
              Mentol, gáfor a ďalšie zložky sa postarajú o svieži efekt, zatiaľ čo MSM pomáha preniknúť účinným látkam
              hlbšie do tkanív.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl space-y-6 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Kedy používať MSM gél</h2>
          </div>
          <div className="mt-10 grid gap-4 text-left sm:grid-cols-2">
            {usageIdeas.map((idea) => (
              <div
                key={idea}
                className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm"
              >
                <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg font-semibold text-emerald-700">
                  •
                </span>
                <span className="text-gray-700">{idea}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl space-y-6 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Prečo práve MSM gél?</h2>
            <p className="text-lg text-gray-600">
              MSM je základná stavebná látka pre zdravé kĺby, chrupavky a svaly. Vďaka vysokej biologickej dostupnosti sa
              ľahko vstrebáva cez pokožku – MSM účinky tak pocítiš presne tam, kde tvoje telo potrebuje podporu.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="#produkty"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-emerald-700"
              >
                🛒 Objednaj Najsilnejší kĺbový gél s MSM
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
        title="Najsilnejší kĺbový gél s MSM"
        description="MSM na kĺby, Boswellia, arnika a mentol v jednom géle. Vyber si samostatné balenie alebo zvýhodnené sety pre komplexnú starostlivosť."
        gridClassName="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
        loadingGridClassName="animate-pulse grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      />
    </main>
  );
}
