import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, CheckCircle2, BookOpen } from 'lucide-react';
import ClientAccordion from './ClientAccordion';
import RelatedPostsByTag from '../../components/RelatedPostsByTag';
import FAQSchema from '../../components/seo/FAQSchema';
import BreadcrumbSchema from '../../components/seo/BreadcrumbSchema';

const benefits = [
  {
    title: 'Protizápalové účinky',
    description: 'MSM má silné protizápalové vlastnosti, ktoré môžu pomôcť zmierniť bolesti a opuchy spojené s rôznymi stavmi kĺbov, vrátane osteoartritídy a reumatoidnej artritídy.'
  },
  {
    title: 'Zlepšenie zdravia kĺbov a chrupavky',
    description: 'MSM podporuje zdravie chrupavky tým, že prispieva k jeho udržaniu a regenerácii. Je to dôležité pre udržanie pružnosti a funkčnosti kĺbov.'
  },
  {
    title: 'Zlepšenie pohyblivosti',
    description: 'Pravidelné užívanie MSM môže viesť k zlepšeniu rozsahu pohybu a celkovej pohyblivosti kĺbov.'
  },
  {
    title: 'Redukcia bolesti',
    description: 'Mnohé štúdie naznačujú, že MSM môže byť účinný pri znižovaní chronickej bolesti kĺbov, najmä tej spojenej s degeneratívnymi zmenami v kĺboch.'
  },
  {
    title: 'Posilnenie imunitného systému',
    description: 'MSM môže tiež podporovať zdravie imunitného systému, čo je dôležité pre celkové zdravie a prevenciu zápalových ochorení.'
  },
  {
    title: 'Podpora zdravia pleti, vlasov a nechtov',
    description: 'MSM je známy aj svojimi výhodami pre zdravie pleti, vlasov a nechtov vďaka svojim sírnym zložkám, ktoré sú nevyhnutné pre produkciu kolagénu a keratínu.'
  }
];

const faqs = [
  {
    question: 'Čo je MSM prášok?',
    answer: 'MSM (Metylsulfonylmetán) je organická sírová zlúčenina, ktorá sa bežne používa ako doplnok stravy. Je známy svojimi protizápalovými vlastnosťami a často sa odporúča na podporu zdravia kĺbov, zlepšenie pružnosti pokožky a posilnenie nechtov a vlasov.'
  },
  {
    question: 'Aké sú hlavné výhody užívania MSM?',
    answer: 'MSM je obľúbený kvôli svojim potenciálnym výhodám, ako je zmierňovanie bolesti kĺbov, zlepšenie pohyblivosti, redukcia zápalu, podpora zdravia pokožky a nechtov, a posilnenie imunitného systému.'
  },
  {
    question: 'Ako MSM prášok funguje?',
    answer: 'MSM poskytuje telu organickú síru, ktorá je dôležitou zložkou pre výrobu kolagénu a keratínu. Tiež môže pomáhať pri redukcii zápalových procesov v tele.'
  },
  {
    question: 'Ako sa má MSM prášok užívať?',
    answer: 'MSM prášok sa zvyčajne rozpúšťa vo vode alebo inej tekutine. Dávkovanie môže byť rôzne, preto je dôležité dodržiavať odporúčania na balení alebo pokyny poskytnuté zdravotníckym odborníkom.'
  }
];

const studies = [
  {
    title: 'Methylsulfonylmethane: Applications and Safety of a Novel Dietary Supplement',
    url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5372953/'
  },
  {
    title: 'The Effect of Daily Methylsulfonylmethane (MSM) Consumption on High-Density Lipoprotein Cholesterol in Healthy Overweight and Obese Adults: A Randomized Controlled Trial',
    url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8540167/'
  },
  {
    title: 'Effects of Methylsulfonylmethane (MSM) on exercise-induced oxidative stress, muscle damage, and pain following a half-marathon: a double-blind, randomized, placebo-controlled trial',
    url: 'https://jissn.biomedcentral.com/articles/10.1186/s12970-017-0181-z'
  }
];

export default function MsmPage() {
  const breadcrumbItems = [
    { name: 'Domov', url: 'https://najsilnejsiaklbovavyziva.sk' },
    { name: 'Zloženie', url: 'https://najsilnejsiaklbovavyziva.sk/zlozenie' },
    { name: 'MSM', url: 'https://najsilnejsiaklbovavyziva.sk/zlozenie/msm' }
  ];

  return (
    <>
      <FAQSchema faqs={faqs} />
      <BreadcrumbSchema items={breadcrumbItems} />
      <main className="py-16">
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
              <h1 className="text-4xl font-bold mb-4">MSM prášok</h1>
              <p className="text-lg text-gray-600 mb-6">
                MSM (metylsulfonylmetán) je organická zlúčenina síry, ktorá sa často používa ako doplnok stravy, 
                predovšetkým pre jej potenciálne prínosy pre zdravie kĺbov.
              </p>
            </div>
            <div className="md:w-1/2 relative aspect-video">
              <Image
                src="/images/ingredients/msm.jpeg"
                alt="MSM prášok"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="rounded-2xl object-cover"
              />
            </div>
          </div>

          {/* Benefits Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8">Účinky MSM prášku</h2>
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
        </div>

        {/* Add RelatedPostsByTag component here */}
        <RelatedPostsByTag tagSlug="msm" title="Články o MSM" maxPosts={6} />

      </div>
    </main>
    </>
  );
} 