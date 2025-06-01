import { ArrowLeft, BookOpen, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import RelatedPostsByTag from '../../components/RelatedPostsByTag';
import ClientAccordion from './ClientAccordion';

const benefits = [
  {
    title: 'Podpora zdravia chrupavky',
    description: 'Glukozamín je zložkou kĺbovej chrupavky a môže pomôcť jeho obnove alebo udržiavaniu zdravia.'
  },
  {
    title: 'Zmiernenie bolesti',
    description: 'Mnohé štúdie naznačujú, že glukozamín môže zmierniť bolesť kĺbov, najmä u ľudí s miernej až stredne závažnou osteoartritídou.'
  },
  {
    title: 'Protizápalové účinky',
    description: 'Glukozamín môže mať mierne protizápalové vlastnosti, ktoré pomáhajú znižovať opuch a zápal spojený s artritídou.'
  },
  {
    title: 'Zlepšenie pohyblivosti',
    description: 'Pravidelné užívanie glukozamínu môže zlepšiť rozsah pohybu a celkovú funkčnosť kĺbov.'
  },
  {
    title: 'Dlhodobé výhody',
    description: 'Niektoré dôkazy naznačujú, že dlhodobé užívanie glukozamínu môže spomaliť progresiu degeneratívnych zmen v kĺboch, aj keď sú potrebné ďalšie štúdie na potvrdenie týchto výsledkov.'
  }
];

const faqs = [
  {
    question: 'Čo je glukozamín?',
    answer: 'Glukozamín je prírodná látka, ktorá sa nachádza v ľudskom tele, najmä v chrupavke. Je to aminocukor, ktorý telo používa na vytvorenie a opravu chrupavky.'
  },
  {
    question: 'Na čo sa glukozamín používa?',
    answer: 'Glukozamín sa najčastejšie používa na liečbu a prevenciu ochorení kĺbov, ako je osteoartritída. Môže pomáhať zmierniť bolesť kĺbov, zlepšiť ich pohyblivosť a spomaliť degeneráciu chrupavky.'
  },
  {
    question: 'Ako funguje glukozamín?',
    answer: 'Glukozamín je základnou stavebnou látkou pre glykosaminoglykány, ktoré sú nevyhnutné pre štruktúru a funkciu chrupavky. Podporuje regeneráciu chrupavkového tkaniva, znižuje zápalové procesy v kĺboch a môže prispievať k tvorbe synoviálnej tekutiny, ktorá slúži na mazanie kĺbov a znižovanie trenia medzi kĺbovými povrchmi.'
  },
  {
    question: 'V akých formách sa glukozamín predáva?',
    answer: 'Glukozamín je dostupný vo forme tablet, kapsúl, práškov a dokonca aj vo forme tekutých doplnkov. Niekedy sa kombinuje s inými zložkami, ako sú chondroitín alebo MSM (metylsulfonylmetán).'
  },
  {
    question: 'Aké sú vedľajšie účinky glukozamínu?',
    answer: 'Glukozamín je všeobecne považovaný za bezpečný, avšak môže spôsobiť niektoré vedľajšie účinky, ako sú tráviace problémy, alergické reakcie alebo interakcie s inými liekmi. Je dôležité konzultovať použitie glukozamínu s lekárom, najmä ak užívate iné lieky.'
  },
  // ... (rest of the FAQs)
];

const studies = [
  {
    title: 'Effectiveness and safety of glucosamine and chondroitin for the treatment of osteoarthritis: a meta-analysis of randomized controlled trials',
    url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6035477/'
  },
  {
    title: 'Effectiveness and Safety of Glucosamine in Osteoarthritis: A Systematic Review',
    url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10366893/'
  },
  {
    title: 'Is there any scientific evidence for the use of glucosamine in the management of human osteoarthritis?',
    url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3392795/'
  },
  {
    title: 'Glucosamine sulphate: an umbrella review of health outcomes',
    url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7768322/'
  }
];

export default function GlucosaminePage() {
  return (
    <main className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <Link
            href="/zlozenie"
            className="inline-flex items-center text-gray-600 hover:text-green-600 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Späť na zloženie
          </Link>

          {/* Hero Section */}
          <div className="flex flex-col md:flex-row gap-8 mb-16">
            <div className="md:w-1/2">
              <h1 className="text-4xl font-bold mb-4">Glukozamín</h1>
              <p className="text-lg text-gray-600 mb-6">
                Glukozamín je prirodzená látka, ktorá sa nachádza v zdravej chrupavke.
                Doplnky sú často používané na podporu zdravia kĺbov, najmä u ľudí trpiacich osteoartritídou.
              </p>
            </div>
            <div className="md:w-1/2 relative aspect-video">
              <Image
                src="/images/ingredients/glukozamin.jpeg"
                alt="Glukozamín"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="rounded-2xl object-cover"
              />
            </div>
          </div>

          {/* Benefits Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8">Účinky glukozamínu</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                      <p className="text-gray-600">{benefit.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8">Často kladené otázky</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <ClientAccordion
                  key={index}
                  title={faq.question}
                  content={faq.answer}
                />
              ))}
            </div>
          </section>

          {/* Studies Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8">Vedecké štúdie</h2>
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="space-y-4">
                {studies.map((study, index) => (
                  <Link
                    key={index}
                    href={study.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-4 p-4 bg-white rounded-xl hover:shadow-md transition-shadow group"
                  >
                    <BookOpen className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-700 group-hover:text-green-600 transition-colors">
                      {study.title}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-green-50 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Najsilnejšia kĺbová výživa - zažite rozdiel!
            </h2>
            <p className="text-gray-600 mb-6">
              S naším unikátnym zložením, ktoré kombinuje prírodné ingrediencie
              s najnovšími vedeckými poznatkami, je naším cieľom ponúknuť vám to
              najlepšie pre vaše kĺby.
            </p>
            <Link
              href="/kupit"
              className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Kúpiť najsilnejšiu kĺbovú výživu
            </Link>
          </section>


          {/* Add RelatedPostsByTag component here */}
          <RelatedPostsByTag tagSlug="glukozamin" title="Články o glukozamíne" maxPosts={6} />

        </div>
      </div>
    </main>
  );
}
