'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, CheckCircle2, BookOpen } from 'lucide-react';
import Accordion from '@/app/components/Accordion';

const benefits = [
  {
    title: 'Tvorba kolagénu',
    description: 'Vitamín C je kľúčový pre syntézu kolagénu, ktorý je základnou zložkou chrupaviek, väzív a kostí. Podporuje tak zdravie kĺbov a pomáha pri ich regenerácii.'
  },
  {
    title: 'Antioxidačné účinky',
    description: 'Ako silný antioxidant chráni bunky pred poškodením voľnými radikálmi a pomáha znižovať oxidačný stres v kĺboch.'
  },
  {
    title: 'Protizápalové vlastnosti',
    description: 'Vitamín C pomáha zmierňovať zápaly v tele, vrátane zápalov kĺbov, čo môže viesť k zníženiu bolesti a zlepšeniu pohyblivosti.'
  },
  {
    title: 'Podpora imunitného systému',
    description: 'Posilňuje imunitný systém, čo je dôležité pre celkové zdravie a prevenciu zápalových ochorení vrátane problémov s kĺbmi.'
  },
  {
    title: 'Regenerácia tkanív',
    description: 'Urýchľuje hojenie a regeneráciu poškodených tkanív, vrátane kĺbových štruktúr.'
  }
];

const faqs = [
  {
    question: 'Prečo je vitamín C dôležitý pre kĺby?',
    answer: 'Vitamín C je kľúčový pre tvorbu kolagénu, ktorý je základnou zložkou chrupaviek a väzív. Bez dostatočného množstva vitamínu C môže byť narušená regenerácia kĺbových tkanív.'
  },
  {
    question: 'Koľko vitamínu C denne potrebujeme?',
    answer: 'Odporúčaná denná dávka vitamínu C sa pohybuje medzi 75-90 mg pre dospelých, ale pri aktívnom životnom štýle alebo pri problémoch s kĺbami môže byť potrebná vyššia dávka.'
  },
  {
    question: 'Môže vitamín C pomôcť pri artritíde?',
    answer: 'Áno, vitamín C môže pomôcť pri artritíde vďaka svojim protizápalovým účinkom a schopnosti podporovať tvorbu kolagénu, ktorý je dôležitý pre zdravie kĺbov.'
  },
  {
    question: 'Aké sú najlepšie zdroje vitamínu C?',
    answer: 'Medzi najlepšie prírodné zdroje vitamínu C patria citrusové ovocie, paprika, brokolica, jahody a kivi. V doplnkoch sa často používa vo forme kyseliny askorbovej.'
  }
];

const studies = [
  {
    title: 'Efficacy of Vitamin C Supplementation on Collagen Synthesis and Oxidative Stress After Musculoskeletal Injuries: A Systematic Review',
    url: 'https://pubmed.ncbi.nlm.nih.gov/30386805/'
  },
  {
    title: 'Collagen and Vitamin C Supplementation Increases Lower Limb Rate of Force Development',
    url: 'https://pubmed.ncbi.nlm.nih.gov/34808597/'
  },
  {
    title: 'Vitamin C in Disease Prevention and Cure: An Overview',
    url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3783921/'
  }
];

export default function VitaminCPage() {
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
              <h1 className="text-4xl font-bold mb-4">Vitamín C</h1>
              <p className="text-lg text-gray-600 mb-6">
                Vitamín C, známy aj ako kyselina askorbová, je nevyhnutný vitamín 
                s mnohými dôležitými funkčnými účinkami v ľudskom tele.
              </p>
            </div>
            <div className="md:w-1/2 relative aspect-video">
              <Image
                src="/images/ingredients/vitamin-c.jpeg"
                alt="Vitamín C"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="rounded-2xl object-cover"
              />
            </div>
          </div>

          {/* Benefits Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8">Účinky vitamínu C</h2>
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