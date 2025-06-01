import { ArrowLeft, BookOpen, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import RelatedPostsByTag from '../../components/RelatedPostsByTag';
import ClientAccordion from './ClientAccordion';

const benefits = [
  {
    title: 'Podpora zdravia chrupavky',
    description: 'Chondroitín pomáha udržiavať vodu v chrupavke a zvyšuje jej pružnosť. Tým prispieva k zachovaniu jej funkcie a štruktúry.'
  },
  {
    title: 'Zmiernenie bolesti',
    description: 'Rovnako ako glukozamín, aj chondroitín môže pomáhať znižovať bolesť spojenú s osteoartritídou. Mnohé štúdie uvádzajú, že chondroitín môže zlepšiť bolestivé príznaky u pacientov s osteoartritídou.'
  },
  {
    title: 'Protizápalové účinky',
    description: 'Chondroitín môže pomôcť znižovať zápal v kĺboch, čo môže prispievať k zmierneniu opuchu a zlepšeniu pohyblivosti.'
  },
  {
    title: 'Spomalenie progresie osteoartritídy',
    description: 'Niektoré štúdie naznačujú, že chondroitín môže spomaliť progresiu osteoartritídy, najmä ak je používaný dlhodobo.'
  },
  {
    title: 'Zlepšenie celkovej funkcie kĺbov',
    description: 'Pravidelným užívaním chondroitínu môžu ľudia zaznamenať zlepšenie pohyblivosti a funkčnosti kĺbov.'
  }
];

const faqs = [
  {
    question: 'Čo je chondroitín?',
    answer: 'Chondroitín je prírodná látka, ktorá sa vyskytuje v spojivovom tkanive ľudí a zvierat. Je to dôležitá súčasť chrupavky, ktorá pomáha udržiavať jej pružnosť a odolnosť.'
  },
  {
    question: 'Aké sú hlavné výhody užívania chondroitínu?',
    answer: 'Chondroitín sa často užíva na podporu zdravia kĺbov, najmä pri stavoch ako osteoartritída. Pomáha udržiavať vodný obsah a pružnosť chrupavky a môže znižovať bolesť a zlepšovať funkciu kĺbov.'
  },
  {
    question: 'Je chondroitín bezpečný?',
    answer: 'Chondroitín je vo všeobecnosti považovaný za bezpečný, keď sa užíva podľa odporúčaní. V niektorých prípadoch však môže spôsobiť vedľajšie účinky ako sú gastrointestinálne problémy.'
  },
  {
    question: 'Ako sa chondroitín užíva?',
    answer: 'Chondroitín sa zvyčajne užíva vo forme doplnkov stravy, buď samostatne alebo v kombinácii s inými látkami, ako je glukozamín.'
  }
];

const studies = [
  {
    title: 'Effectiveness and safety of glucosamine and chondroitin for the treatment of osteoarthritis: a meta-analysis of randomized controlled trials',
    url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6035477/'
  },
  {
    title: 'Do glucosamine and chondroitin supplements actually work for arthritis?',
    url: 'https://www.health.harvard.edu/blog/the-latest-on-glucosaminechondroitin-supplements-2016101710391'
  },
  {
    title: 'Glucosamine and Chondroitin for Osteoarthritis: What You Need To Know',
    url: 'https://www.nccih.nih.gov/health/glucosamine-and-chondroitin-for-osteoarthritis-what-you-need-to-know'
  },
  {
    title: 'Glucosamine and chondroitin for knee osteoarthritis: a double-blind randomised placebo-controlled clinical trial evaluating single and combination regimens',
    url: 'https://ard.bmj.com/content/74/5/851'
  }
];

export default function ChondroitinPage() {
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
              <h1 className="text-4xl font-bold mb-4">Chondroitín</h1>
              <p className="text-lg text-gray-600 mb-6">
                Chondroitín je ďalšou prirodzene sa vyskytujúcou látkou v kĺbovej chrupavke,
                ktorá je často používaná v doplnkoch na podporu zdravia kĺbov, najmä u ľudí s osteoartritídou.
              </p>
            </div>
            <div className="md:w-1/2 relative aspect-video">
              <Image
                src="/images/ingredients/chondroitin.jpeg"
                alt="Chondroitín"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="rounded-2xl object-cover"
              />
            </div>
          </div>

          {/* Benefits Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8">Účinky chondroitínu</h2>
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
        <RelatedPostsByTag tagSlug="chondroitin" title="Články o chondroitíne" maxPosts={6} />

      </div>
    </main>
  );
}
