import Link from 'next/link';
import Accordion from '../Accordion';

// Define the FAQ data directly in this component
const faqs = [
  {
    question: 'Čo presne obsahuje "Najsilnejšia kĺbová výživa - JointBoost"?',
    answer: 'JointBoost obsahuje kombináciu glukozamínu, chondroitínu, MSM, vitamínu C, morského kolagénu typu 2, kurkumínu, BioPerine, kyseliny hyaluronovej a Boswellie serrata. Tieto zložky sú zamerané na podporu zdravia a funkcie kĺbov.'
  },
  {
    question: 'Ako môže JointBoost pomôcť mojim kĺbom?',
    answer: 'Tento doplnok podporuje regeneráciu kĺbového tkaniva, pomáha udržiavať pružnosť a hydratáciu chrupavky, zmierňuje bolesť a zápal v kĺboch a podporuje syntézu kolagénu. Môže tiež zlepšovať pohyblivosť kĺbov a znižovať diskomfort.'
  },
  {
    question: 'Je JointBoost vhodný pre vegetariánov?',
    answer: 'JointBoost obsahuje zložky, ktoré sú prevažne vegetariánske. Výnimku tvoria morský kolagén typu 2, glukozamín hydrochlorid a chondroitín sulfát, ktoré nie sú vhodné pre vegetariánov. Ostatné zložky, vrátane kapsúl HPMC z rastlinnej celulózy, sú vegetariánske.'
  },
  {
    question: 'Ako často by som mal/a užívať JointBoost?',
    answer: 'Odporúčané dávkovanie je 1 kapsula denne. Zapiť dostatočným množstvom vody. Pre individuálne odporúčania sa poraďte so svojím zdravotníckym poskytovateľom.'
  },
  {
    question: 'Môžem užívať JointBoost spolu s inými liekmi alebo doplnkami?',
    answer: 'Pred začatím užívania JointBoost spolu s inými liekmi alebo doplnkami sa odporúča konzultácia s lekárom alebo farmaceutom.'
  },
  {
    question: 'Ako dlho trvá, kým uvidím výsledky po užívaní JointBoost?',
    answer: 'Výsledky sa môžu líšiť v závislosti od jednotlivca a stupňa poškodenia alebo opotrebenia kĺbov. Niektorí užívatelia môžu pociťovať zlepšenie už po niekoľkých týždňoch, zatiaľ čo iní môžu potrebovať dlhšie obdobie.'
  },
  // Add more relevant FAQs for the landing page if needed
];

export default function FAQ() {
  return (
    <section className="py-16 md:py-24 bg-white"> {/* Or bg-gray-50 if preferred */}
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Často kladené otázky
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Accordion
                key={index}
                title={faq.question}
                content={faq.answer}
              />
            ))}
          </div>
           {/* Changed <a> to <Link> */}
           <div className="text-center mt-12">
              <Link href="/casto-kladene-otazky" className="text-green-600 hover:text-green-700 font-medium">
                 Zobraziť všetky otázky →
              </Link>
           </div>
        </div>
      </div>
    </section>
  );
}
