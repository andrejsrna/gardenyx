'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, CheckCircle2, BookOpen } from 'lucide-react';
import Accordion from '@/app/components/Accordion';

const benefits = [
  {
    title: 'Hydratácia kĺbov',
    description: 'Kyselina hyaluronová je kľúčová pre udržiavanie správnej hydratácie kĺbov a synoviálnej tekutiny, čo pomáha znižovať trenie medzi kosťami.'
  },
  {
    title: 'Protizápalové účinky',
    description: 'Má prirodzené protizápalové vlastnosti, ktoré môžu pomôcť zmierniť zápal v kĺboch a okolnom tkanive.'
  },
  {
    title: 'Podpora mobility',
    description: 'Pomáha zlepšovať pohyblivosť kĺbov a znižovať stuhnutosť, najmä u ľudí s osteoartrózou.'
  },
  {
    title: 'Regenerácia chrupavky',
    description: 'Podporuje regeneráciu a obnovu kĺbovej chrupavky, čo je dôležité pre dlhodobé zdravie kĺbov.'
  },
  {
    title: 'Zmiernenie bolesti',
    description: 'Môže pomôcť zmierniť bolesť kĺbov tým, že poskytuje lepšie mazanie a znižuje trenie medzi kĺbovými plochami.'
  }
];

const faqs = [
  {
    question: 'Ako kyselina hyaluronová pomáha kĺbom?',
    answer: 'Kyselina hyaluronová je prirodzenou súčasťou synoviálnej tekutiny v kĺboch, kde pôsobí ako lubrikant a tlmič nárazov. Pomáha udržiavať správnu hydratáciu kĺbov a podporuje ich pohyblivosť.'
  },
  {
    question: 'Je kyselina hyaluronová bezpečná?',
    answer: 'Áno, kyselina hyaluronová je prirodzene sa vyskytujúca látka v tele a je všeobecne považovaná za bezpečnú. Avšak, ako pri každom doplnku, je dôležité dodržiavať odporúčané dávkovanie.'
  },
  {
    question: 'Ako dlho trvá, kým sa prejavia účinky?',
    answer: 'Účinky sa môžu prejaviť po niekoľkých týždňoch pravidelného užívania. Individuálne výsledky sa môžu líšiť v závislosti od závažnosti problémov s kĺbmi.'
  },
  {
    question: 'Pre koho je kyselina hyaluronová vhodná?',
    answer: 'Je vhodná pre ľudí s problémami s kĺbami, športovcov, starších ľudí a všetkých, ktorí chcú podporiť zdravie svojich kĺbov. Pred užívaním je vhodné poradiť sa s lekárom.'
  }
];

const studies = [
  {
    title: 'Hyaluronic acid in the treatment of osteoarthritis of the knee',
    url: 'https://pubmed.ncbi.nlm.nih.gov/10461471/'
  },
  {
    title: 'Effectiveness and utility of hyaluronic acid in osteoarthritis',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4469223/'
  },
  {
    title: 'Hyaluronic acid for the treatment of knee osteoarthritis: long-term outcomes from a naturalistic primary care experience',
    url: 'https://pubmed.ncbi.nlm.nih.gov/15785261/'
  }
];

export default function KyselinaHyaluronovaPage() {
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
              <h1 className="text-4xl font-bold mb-4">Kyselina hyaluronová</h1>
              <p className="text-lg text-gray-600 mb-6">
                Kyselina hyaluronová je prirodzene sa vyskytujúca látka v ľudskom tele, 
                známa pre svoju schopnosť udržiavať vlhkosť a podporovať zdravie kĺbov.
              </p>
            </div>
            <div className="md:w-1/2 relative aspect-video">
              <Image
                src="/images/ingredients/kyselina-hyaluronova.jpeg"
                alt="Kyselina hyaluronová"
                fill
                className="rounded-2xl object-cover"
              />
            </div>
          </div>

          {/* Benefits Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8">Účinky kyseliny hyaluronovej</h2>
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