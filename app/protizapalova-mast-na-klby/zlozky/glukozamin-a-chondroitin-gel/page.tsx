import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Products from '../../../components/landing-page/Products';

export const metadata: Metadata = {
  title: 'Glukozamín a chondroitín gél – regenerácia chrupaviek zvonka',
  description:
    'Glukozamín a chondroitín gél zlepšuje pružnosť kĺbov, podporuje regeneráciu chrupavky a pôsobí lokálne bez mastného filmu. Spoznaj účinky v Najsilnejšom kĺbovom géle.',
};

const benefits = [
  'Podporujú prirodzenú regeneráciu chrupavky.',
  'Pomáhajú zlepšiť pohyblivosť a flexibilitu kĺbov.',
  'Znižujú pocit napätia a únavy v svaloch a šľachách.',
  'Pôsobia synergicky s MSM, arnikou a Boswelliou.',
  'Zlepšujú hydratáciu pokožky a vstrebávanie aktívnych látok.',
];

const comboItems = [
  { label: 'MSM', description: 'regenerácia spojivových tkanív' },
  { label: 'Arnika montana', description: 'revitalizácia pokožky' },
  { label: 'Boswellia serrata', description: 'podpora pružnosti kĺbov' },
  { label: 'Mentol a gáfor', description: 'chladivý efekt a okamžitá úľava' },
];

const usageIdeas = [
  'Pri stuhnutosti alebo bolesti kĺbov.',
  'Po športovom výkone alebo dlhom sedení.',
  'Pri zvýšenej fyzickej záťaži alebo práci v stoji.',
  'Ako doplnkovú starostlivosť k výživovým doplnkom na kĺby (napr. Joint Boost).',
];

export default function GlukozaminChondroitinGelPage() {
  return (
    <main className="bg-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-emerald-100/40 py-16 md:py-24">
        <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent)] md:block" />
        <div className="container relative mx-auto px-4">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div className="space-y-6 text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                🦴 Glukozamín & chondroitín gél
              </span>
              <h1 className="text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
                Glukozamín a chondroitín gél – regenerácia a výživa kĺbov zvonka
              </h1>
              <p className="text-lg text-gray-600 md:text-xl">
                Glukozamín a chondroitín sú prirodzené súčasti chrupaviek, šliach a väzív. V gélovej forme pôsobia
                lokálne, pomáhajú zlepšiť pružnosť tkanív, podporujú regeneráciu a zmierňujú diskomfort spôsobený
                preťažením alebo stuhnutosťou.
              </p>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  href="#produkty"
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-colors hover:bg-emerald-700"
                >
                  Objednať gél na chrupavky
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
                  alt="Glukozamín a chondroitín gél aplikovaný na koleno"
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
            <h2 className="text-3xl font-bold text-gray-900">Čo je glukozamín a chondroitín?</h2>
            <p className="text-lg text-gray-600">
              Tieto látky tvoria základ zdravých, pružných a pohyblivých kĺbov. Vo forme gélu pôsobia priamo na miesto
              potreby – zlepšujú výživu chrupavky, zmierňujú napätie okolitého tkaniva a podporujú prirodzené hojivé
              procesy.
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
            <h2 className="text-3xl font-bold text-gray-900">Glukozamín a chondroitín v Najsilnejšom kĺbovom géle</h2>
            <p className="text-lg text-gray-600">
              Na dosiahnutie komplexného účinku ich spájame s ďalšími aktívnymi látkami:
            </p>
          </div>
          <div className="mt-10 grid gap-4 text-left sm:grid-cols-2">
            {comboItems.map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm"
              >
                <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
                  {item.label}
                </span>
                <span className="text-gray-700">{item.description}</span>
              </div>
            ))}
          </div>
          <p className="mt-10 text-center text-base text-gray-600">
            Výsledkom je gél, ktorý uvoľňuje, regeneruje a pomáha udržiavať zdravú štruktúru kĺbov a chrupaviek – bez
            mastného filmu a s rýchlym vstrebávaním.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl space-y-6 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Kedy používať gél s glukozamínom a chondroitínom</h2>
          </div>
          <div className="mt-10 grid gap-4 text-left sm:grid-cols-2">
            {usageIdeas.map((idea) => (
              <div
                key={idea}
                className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm"
              >
                <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg font-semibold text-emerald-700">
                  ⏱
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
            <h2 className="text-3xl font-bold text-gray-900">Prečo zvoliť glukozamín a chondroitín vo forme gélu</h2>
            <p className="text-lg text-gray-600">
              Na rozdiel od výživových doplnkov pôsobí lokálne a rýchlo – presne tam, kde pociťuješ diskomfort.
              Gél sa okamžite vstrebáva, nezanecháva mastný film a je vhodný na každodenné používanie.
            </p>
            <p className="text-base text-gray-600">
              V kombinácii s ostatnými účinnými zložkami pomáha udržať tvoje kĺby silné, pružné a bez obmedzení – či už
              športuješ, veľa sedíš alebo stojíš pri práci.
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
        title="Najsilnejší kĺbový gél s glukozamínom a chondroitínom"
        description="Glukozamín gél + chondroitín, MSM, arnika a Boswellia v jednom produkte. Vyber si samostatné balenie alebo zvýhodnené sety."
        gridClassName="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
        loadingGridClassName="animate-pulse grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      />
    </main>
  );
}
