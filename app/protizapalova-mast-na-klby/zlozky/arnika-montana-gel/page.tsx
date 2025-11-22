import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Products from '../../../components/landing-page/Products';
import JointBoostGelIngredients from '../../../components/product/JointBoostGelIngredients';

export const metadata: Metadata = {
  title: 'Arnika montana gél – prírodná pomoc na stuhnuté kĺby a svaly',
  description:
    'Objav arnika montana gél – horská arnika v modernej, rýchlo vstrebateľnej forme pre stuhnuté kĺby a unavené svaly. Účinky, použitie a dôvody, prečo je v Najsilnejšom kĺbovom géle.',
};

const benefitBullets = [
  'Podporuje regeneráciu svalov po športovom výkone',
  'Zmierňuje pocit stuhnutosti a napätia v kĺboch',
  'Prináša osviežujúci chladivý efekt',
  'Zlepšuje prekrvenie a prispieva k rýchlejšiemu zotaveniu',
  'Pôsobí blahodarne na drobné pomliaždeniny či namáhané časti tela',
];

const usageIdeas = [
  'Po športovom výkone alebo fyzickej záťaži',
  'Pri stuhnutosti krku, chrbta či ramien',
  'Na regeneráciu po turistike, cvičení alebo práci v stoji',
  'Na lokálnu starostlivosť o namáhané kĺby a svaly',
];

export default function ArnikaMontanaGelPage() {
  return (
    <main className="bg-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-emerald-100/40 py-16 md:py-24">
        <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent)] md:block" />
        <div className="container relative mx-auto px-4">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div className="space-y-6 text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                🌼 Arnika montana gél
              </span>
              <h1 className="text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
                Arnika montana gél – prírodná pomoc pri stuhnutosti a únave svalov
              </h1>
              <p className="text-lg text-gray-600 md:text-xl">
                Arnika montana, známa aj ako horská arnika, je tradičná liečivá rastlina z alpských oblastí.
                V modernej gélovej forme prináša protizápalové, regeneračné a revitalizačné účinky – ideálne
                pre všetkých, ktorí chcú rýchlo uvoľniť namáhané kĺby a svaly.
              </p>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  href="#produkty"
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-colors hover:bg-emerald-700"
                >
                  Objednať gél s arnikou
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
                  alt="Aplikácia gélu s Arnika montana na koleno"
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
            <h2 className="text-3xl font-bold text-gray-900">Čo je arnika montana?</h2>
            <p className="text-lg text-gray-600">
              Horská arnika je storočia uznávaná bylina pre svaly, kĺby aj pokožku. V arnika géle alebo arnika
              masti pomáha zmierňovať napätie po fyzickej záťaži, revitalizuje tkanivá a podporuje prirodzené
              hojivé procesy tela.
            </p>
          </div>
          <div className="mt-10 grid gap-4 text-left sm:grid-cols-2">
            {benefitBullets.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm"
              >
                <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg font-semibold text-emerald-700">
                  ✓
                </span>
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-emerald-50/70 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl space-y-6 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Arnika montana v Najsilnejšom kĺbovom géle</h2>
            <p className="text-lg text-gray-600">
              V našom géle tvorí arnika extrakt jednu z hlavných aktívnych zložiek. Dopĺňa ju{' '}
              <Link className="text-emerald-600 hover:underline" href="/zlozenie/msm">
                MSM
              </Link>{' '}
              pre regeneráciu tkanív – spolu s mentolom a gáforom prinášajú komplexný, rýchlo pôsobiaci efekt.
            </p>
            <p className="text-base text-gray-600">
              Špeciálna receptúra sa rýchlo vstrebáva, nezanecháva mastný film a pôsobí presne tam, kde to telo
              potrebuje.
            </p>
            <p className="text-base text-gray-600">
              Pri potrebe výživy chrupaviek a dlhodobej ochrany kĺbov pridaj do rutiny aj vnútornú výživu, napríklad{' '}
              <Link className="text-emerald-600 hover:underline" href="/joint-boost">
                Joint Boost
              </Link>
              , ktorý pôsobí zvnútra.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl space-y-6 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Kedy používať arnikovú masť (gél)</h2>
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
            <h2 className="text-3xl font-bold text-gray-900">Spojenie tradície a modernej kozmetiky</h2>
            <p className="text-lg text-gray-600">
              Arnika montana patrí medzi najstaršie byliny využívané v prírodnej medicíne. V Najsilnejšom kĺbovom
              géle spája tradičné účinky s modernou, rýchlo vstrebateľnou textúrou, ktorá sa postará o tvoje svaly
              a kĺby každý deň.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="#produkty"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-emerald-700"
              >
                🛒 Vyskúšaj arnikovú masť teraz
              </Link>
              <div className="rounded-full bg-emerald-100 px-5 py-3 text-sm font-semibold text-emerald-700">
                Doručenie do 24 h • Doprava zdarma nad 40 €
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <JointBoostGelIngredients />
        </div>
      </div>

      <Products
        productIds={[669, 824, 684]}
        title="Najsilnejší kĺbový gél s arnikou"
        description="Vyber si samostatnú tubu gélu alebo zvýhodnené balíčky, ktoré spájajú arniku montanu s Boswelliou, MSM a mentolom pre komplexnú starostlivosť o kĺby."
        gridClassName="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
        loadingGridClassName="animate-pulse grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      />
    </main>
  );
}
