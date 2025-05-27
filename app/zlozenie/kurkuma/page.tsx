'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, CheckCircle2, BookOpen } from 'lucide-react';
import Accordion from '@/app/components/Accordion';

const benefits = [
  {
    title: 'Protizápalové účinky',
    description: 'Kurkumín, hlavná bioaktívna zložka kurkumy, má silné protizápalové vlastnosti. Tieto vlastnosti môžu pomôcť znižovať zápal a bolesť spojené s rôznymi artritídnymi stavmi, ako je osteoartritída a reumatoidná artritída.'
  },
  {
    title: 'Zmiernenie bolesti',
    description: 'Mnohé štúdie naznačujú, že kurkumín môže byť rovnako účinný ako niektoré protizápalové lieky (NSAID) pri zmiernení bolesti kĺbov bez významných vedľajších účinkov.'
  },
  {
    title: 'Zlepšenie pohyblivosti',
    description: 'Pravidelné užívanie kurkumy môže zlepšiť rozsah pohybu a celkovú funkčnosť kĺbov u ľudí trpiacich artritídnymi ochoreniami.'
  },
  {
    title: 'Antioxidantné účinky',
    description: 'Kurkumín tiež pôsobí ako silný antioxidant, ktorý pomáha chrániť bunky pred poškodením spôsobeným voľnými radikálmi.'
  },
  {
    title: 'Podpora zdravia chrupavky',
    description: 'Kurkumín môže pomôcť udržiavať zdravie kĺbovej chrupavky a spomaliť jej degeneráciu, čo je dôležité pre prevenciu a liečbu osteoartritídy.'
  }
];

const faqs = [
  {
    question: 'Ako kurkuma pomáha kĺbom?',
    answer: 'Kurkuma má protizápalové vlastnosti, čo môže pomôcť zmierniť zápal a bolesť spojenú s kĺbovými problémami, ako je artritída.'
  },
  {
    question: 'Je kurkuma efektívna pri liečbe artritídy?',
    answer: 'Niektoré štúdie naznačujú, že kurkuma môže pomáhať zmierniť príznaky artritídy vďaka svojim protizápalovým účinkom. Avšak, potrebujeme viac výskumu na potvrdenie jej efektívnosti.'
  },
  {
    question: 'Ako by som mal prijímať kurkumu pre zdravie kĺbov?',
    answer: 'Kurkumu môžete prijímať v rôznych formách, ako sú kapsuly, prášok alebo čaj. Odporúčané dávkovanie sa môže líšiť, preto je dôležité dodržiavať pokyny výrobcu alebo sa poradiť s lekárom.'
  },
  {
    question: 'Existujú nejaké vedľajšie účinky prijímania kurkumy?',
    answer: 'Kurkuma je všeobecne považovaná za bezpečnú, ale v niektorých prípadoch môže spôsobiť žalúdočné problémy alebo iné nežiaduce účinky, najmä pri vyšších dávkach.'
  }
];

const studies = [
  {
    title: 'Therapeutic effects of turmeric or curcumin extract on pain and function for individuals with knee osteoarthritis: a systematic review',
    url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7812094/'
  },
  {
    title: 'Efficacy of Turmeric Extracts and Curcumin for Alleviating the Symptoms of Joint Arthritis: A Systematic Review and Meta-Analysis of Randomized Clinical Trials',
    url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5003001/'
  },
  {
    title: 'Effect of curcumin on rheumatoid arthritis: a systematic review and meta-analysis',
    url: 'https://www.frontiersin.org/articles/10.3389/fimmu.2023.1121655/full'
  }
];

export default function KurkumaPage() {
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
              <h1 className="text-4xl font-bold mb-4">Kurkuma</h1>
              <p className="text-lg text-gray-600 mb-6">
                Kurkuma, známa pre svoju aktívnu zložku kurkumín, je často ospevovaná 
                pre jej potenciálne prínosy pre zdravie, najmä v oblasti podpory zdravia kĺbov.
              </p>
            </div>
            <div className="md:w-1/2 relative aspect-video">
              <Image
                src="/images/ingredients/kurkuma.jpeg"
                alt="Kurkuma"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="rounded-2xl object-cover"
              />
            </div>
          </div>

          {/* Benefits Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8">Účinky kurkumy</h2>
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