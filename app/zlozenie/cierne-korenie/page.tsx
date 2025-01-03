'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, CheckCircle2, BookOpen } from 'lucide-react';
import Accordion from '@/app/components/Accordion';

const benefits = [
  {
    title: 'Zvýšenie absorpcie nutrientov',
    description: 'Piperín zvyšuje biologickú dostupnosť mnohých živín a doplnkov, vrátane kurkumínu (z kurkumy), selénu, betakaroténu a vitamínu B6. Tým podporuje efektívnejšie využitie týchto živín telom.'
  },
  {
    title: 'Protizápalové účinky',
    description: 'Podobne ako kurkuma, piperín má tiež protizápalové vlastnosti, ktoré môžu pomôcť zmierniť bolesť a zápal, najmä pri artritídnych ochoreniach.'
  },
  {
    title: 'Podpora trávenia',
    description: 'Piperín môže stimulovať tráviace enzýmy a zlepšovať trávenie. Pomáha tiež pri absorpcii živín v črevách.'
  },
  {
    title: 'Antioxidantné účinky',
    description: 'Extrakt z čierneho korenia môže pôsobiť ako antioxidant, čím pomáha chrániť telo pred poškodením spôsobeným voľnými radikálmi.'
  },
  {
    title: 'Podpora metabolizmu',
    description: 'Piperín môže tiež mierne zvyšovať metabolizmus, čo môže pomôcť pri kontrole telesnej hmotnosti.'
  },
  {
    title: 'Podpora mozgovej funkcie',
    description: 'Niektoré štúdie naznačujú, že piperín môže mať neuroprotektívne účinky, ktoré môžu podporovať mozgovú funkciu a znižovať riziko neurodegeneratívnych ochorení.'
  }
];

const faqs = [
  {
    question: 'Ako čierne korenie ovplyvňuje kĺby?',
    answer: 'Čierne korenie, resp. jeho aktívna zložka piperín, má významný vplyv na zdravie kĺbov prostredníctvom viacerých mechanizmov. Primárne zvyšuje biologickú dostupnosť protizápalových látok ako kurkumín, čím podporuje ich terapeutický účinok. Samotný piperín má tiež protizápalové vlastnosti, ktoré môžu pomôcť zmierniť zápal v kĺboch. Navyše jeho antioxidačné účinky chránia kĺbové tkanivá pred oxidačným stresom.'
  },
  {
    question: 'Sú nejaké vedľajšie účinky pri konzumácii čierneho korenia pre zdravie kĺbov?',
    answer: 'Vo väčšine prípadov je konzumácia čierneho korenia v bežných množstvách bezpečná. Nadmerná konzumácia môže však viesť k tráviacim problémom alebo iným vedľajším účinkom.'
  },
  {
    question: 'Môže čierne korenie nahradiť bežné lieky na kĺby?',
    answer: 'Čierne korenie by sa nemalo používať ako náhrada za bežné lieky predpísané na problémy s kĺbmi. Je dôležité konzultovať jeho použitie s lekárom ako súčasť komplexnej liečby.'
  },
  {
    question: 'Existujú štúdie podporujúce použitie čierneho korenia pri problémoch s kĺbmi?',
    answer: 'Existuje obmedzený počet štúdií, ktoré skúmali účinky piperínu na zdravie kĺbov. Výskum v tejto oblasti je stále v počiatočných fázach a sú potrebné ďalšie štúdie na potvrdenie jeho účinkov.'
  }
];

const studies = [
  {
    title: 'Black pepper and its pungent principle-piperine: a review of diverse physiological effects',
    url: 'https://pubmed.ncbi.nlm.nih.gov/17987447/'
  },
  {
    title: 'Molecular and pharmacological aspects of piperine as a potential molecule for disease prevention and management: evidence from clinical trials',
    url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8796742/'
  },
  {
    title: 'Piperine-A Major Principle of Black Pepper: A Review of Its Bioactivity and Studies',
    url: 'https://www.mdpi.com/2076-3417/9/20/4270'
  },
  {
    title: 'Anti-inflammatory and antiarthritic effects of piperine in human interleukin 1β-stimulated fibroblast-like synoviocytes and in rat arthritis models',
    url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2688199/'
  }
];

export default function CierneKoreniePage() {
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
              <h1 className="text-4xl font-bold mb-4">Extrakt z čierneho korenia</h1>
              <p className="text-lg text-gray-600 mb-6">
                Extrakt z čierneho korenia, známy tiež ako piperín, je bioaktívna zložka, 
                ktorá sa nachádza v čiernom korení. Piperín je známy pre svoje rôzne zdravotné 
                prínosy a schopnosť zvyšovať absorpciu iných látok.
              </p>
            </div>
            <div className="md:w-1/2 relative aspect-video">
              <Image
                src="/images/ingredients/cierne-korenie.jpeg"
                alt="Extrakt z čierneho korenia"
                fill
                className="rounded-2xl object-cover"
              />
            </div>
          </div>

          {/* Benefits Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8">Účinky čierneho korenia</h2>
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