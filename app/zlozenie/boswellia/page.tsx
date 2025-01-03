'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, CheckCircle2, BookOpen } from 'lucide-react';
import Accordion from '@/app/components/Accordion';

const benefits = [
  {
    title: 'Protizápalové účinky',
    description: 'Boswellia serrata obsahuje boswellové kyseliny, ktoré majú silné protizápalové vlastnosti a môžu pomôcť zmierniť zápal v kĺboch.'
  },
  {
    title: 'Úľava od bolesti',
    description: 'Pomáha zmierňovať bolesť kĺbov prirodzeným spôsobom, bez vedľajších účinkov typických pre konvenčné protizápalové lieky.'
  },
  {
    title: 'Podpora mobility kĺbov',
    description: 'Pravidelné užívanie môže pomôcť zlepšiť pohyblivosť kĺbov a znížiť stuhnutosť, najmä u ľudí s artritídou.'
  },
  {
    title: 'Ochrana chrupavky',
    description: 'Boswellia môže pomôcť chrániť kĺbovú chrupavku pred poškodením a podporovať jej zdravie.'
  },
  {
    title: 'Dlhodobá bezpečnosť',
    description: 'Je považovaná za bezpečnú pre dlhodobé užívanie, s minimom vedľajších účinkov.'
  }
];

const faqs = [
  {
    question: 'Ako Boswellia serrata pomáha pri problémoch s kĺbmi?',
    answer: 'Boswellia serrata obsahuje aktívne zlúčeniny zvané boswellové kyseliny, ktoré majú protizápalové účinky. Tieto látky pomáhajú znižovať zápal v kĺboch a zmierňovať bolesť.'
  },
  {
    question: 'Je Boswellia serrata bezpečná na užívanie?',
    answer: 'Áno, Boswellia serrata je považovaná za bezpečnú pre väčšinu ľudí. Má dlhú históriu používania v tradičnej medicíne a menej vedľajších účinkov v porovnaní s bežnými protizápalovými liekmi.'
  },
  {
    question: 'Ako dlho trvá, kým sa prejavia účinky?',
    answer: 'Účinky sa môžu prejaviť po niekoľkých týždňoch pravidelného užívania. Niektorí ľudia môžu pocítiť úľavu už po niekoľkých dňoch, ale pre optimálne výsledky sa odporúča dlhodobé užívanie.'
  },
  {
    question: 'Môže sa Boswellia serrata kombinovať s inými doplnkami?',
    answer: 'Áno, Boswellia serrata sa často kombinuje s inými prírodnými látkami na podporu zdravia kĺbov, ako je kurkumín alebo glukozamín. Pred kombinovaním s liekmi sa poraďte s lekárom.'
  }
];

const studies = [
  {
    title: 'Efficacy and tolerability of Boswellia serrata extract in treatment of osteoarthritis of knee--a randomized double blind placebo controlled trial',
    url: 'https://pubmed.ncbi.nlm.nih.gov/12622457/'
  },
  {
    title: 'A standardized Boswellia serrata extract shows improvements in knee osteoarthritis within five days-a double-blind, randomized, three-arm, parallel-group, multi-center, placebo-controlled trial',
    url: 'https://pubmed.ncbi.nlm.nih.gov/39092235/'
  },
  {
    title: 'A Standardized Boswellia serrata Extract Improves Knee Joint Function and Cartilage Morphology in Human Volunteers with Mild to Moderate Osteoarthritis in a Randomized Placebo-Controlled Study',
    url: 'https://pubmed.ncbi.nlm.nih.gov/39700461/'
  }
];

export default function BoswelliaSerataPage() {
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
              <h1 className="text-4xl font-bold mb-4">Boswellia Serata</h1>
              <p className="text-lg text-gray-600 mb-6">
                Boswellia serrata, známa tiež ako indická kadidlovnica, je rastlina 
                tradične používaná v ajurvédskej medicíne. Je známa pre svoje protizápalové 
                a analgetické účinky, najmä v oblasti liečby rôznych zápalových ochorení.
              </p>
            </div>
            <div className="md:w-1/2 relative aspect-video">
              <Image
                src="/images/ingredients/boswellia-serata.jpeg"
                alt="Boswellia serata"
                fill
                className="rounded-2xl object-cover"
              />
            </div>
          </div>

          {/* Benefits Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8">Účinky Boswellia serrata</h2>
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