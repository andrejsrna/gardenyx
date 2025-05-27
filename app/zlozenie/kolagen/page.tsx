'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, CheckCircle2, BookOpen } from 'lucide-react';
import Accordion from '@/app/components/Accordion';

const benefits = [
  {
    title: 'Podpora zdravia kĺbov',
    description: 'Kolagén je základnou zložkou kĺbovej chrupavky a pomáha udržiavať jej pružnosť a pevnosť. Pravidelné dopĺňanie kolagénu môže pomôcť zmierniť bolesti kĺbov a zlepšiť ich pohyblivosť.'
  },
  {
    title: 'Regenerácia chrupavky',
    description: 'Kolagén podporuje prirodzenú regeneráciu chrupavky a môže pomôcť spomaliť jej degeneráciu spojenú so starnutím alebo nadmernou záťažou.'
  },
  {
    title: 'Protizápalové účinky',
    description: 'Niektoré štúdie naznačujú, že kolagén môže pomôcť znížiť zápal v kĺboch, čo vedie k zmierneniu bolesti a lepšej pohyblivosti.'
  },
  {
    title: 'Pevnosť väzív a šliach',
    description: 'Kolagén je kľúčový pre zdravie väzív a šliach, ktoré sú nevyhnutné pre správnu funkciu kĺbov a celého pohybového aparátu.'
  },
  {
    title: 'Podpora hojenia',
    description: 'Pri poraneniach kĺbov alebo väzív môže dostatočný príjem kolagénu urýchliť proces hojenia a regenerácie tkanív.'
  }
];

const faqs = [
  {
    question: 'Čo je kolagén a prečo je dôležitý?',
    answer: 'Kolagén je proteín, ktorý tvorí základnú stavebnú jednotku spojivových tkanív v našom tele. Je kľúčový pre zdravie kĺbov, kostí, kože, vlasov a nechtov. S vekom jeho prirodzená produkcia klesá, preto je dôležité ho dopĺňať.'
  },
  {
    question: 'Aké typy kolagénu existujú?',
    answer: 'Existuje niekoľko typov kolagénu, pričom najdôležitejšie sú typ I (kosti, koža), typ II (chrupavky) a typ III (koža, svaly). Pre zdravie kĺbov je najdôležitejší kolagén typu II.'
  },
  {
    question: 'Ako dlho trvá, kým sa prejavia účinky kolagénu?',
    answer: 'Účinky suplementácie kolagénom sa môžu prejaviť po 4-8 týždňoch pravidelného užívania. Individuálne výsledky sa môžu líšiť v závislosti od veku, životného štýlu a celkového zdravotného stavu.'
  },
  {
    question: 'Je kolagén bezpečný na užívanie?',
    answer: 'Kolagén je všeobecne považovaný za bezpečný doplnok výživy. Je prirodzene sa vyskytujúcou látkou v tele a má minimum vedľajších účinkov. Vždy je však dobré konzultovať užívanie s lekárom.'
  }
];

const studies = [
  {
    title: 'Effect of collagen supplementation on osteoarthritis symptoms: a meta-analysis of randomized placebo-controlled trials',
    url: 'https://pubmed.ncbi.nlm.nih.gov/30368550/'
  },
  {
    title: 'Collagen supplementation for skin health: A mechanistic systematic review',
    url: 'https://pubmed.ncbi.nlm.nih.gov/33742704/'
  },
  {
    title: '24-Week study on the use of collagen hydrolysate as a dietary supplement in athletes with activity-related joint pain',
    url: 'https://pubmed.ncbi.nlm.nih.gov/18416885/'
  }
];

export default function KolagenPage() {
  return (
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
              <h1 className="text-4xl font-bold mb-4">Kolagén typu 2</h1>
              <p className="text-lg text-gray-600 mb-6">
                Kolagén je najhojnejší proteín v ľudskom tele, dôležitý pre mnohé 
                aspekty nášho zdravia.
              </p>
            </div>
            <div className="md:w-1/2 relative aspect-video">
              <Image
                src="/images/ingredients/kolagen.jpeg"
                alt="Kolagén"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="rounded-2xl object-cover"
              />
            </div>
          </div>

          {/* Benefits Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8">Účinky kolagénu</h2>
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
                <Accordion
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
      </div>
    </main>
  );
} 