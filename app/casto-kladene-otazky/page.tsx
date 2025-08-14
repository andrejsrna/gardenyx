import { Metadata } from 'next';
import Accordion from './Accordion';
import FAQSchema from '../components/seo/FAQSchema';

export const metadata: Metadata = {
  title: 'Často kladené otázky | Najsilnejšia kĺbová výživa',
  description: 'Nájdite odpovede na najčastejšie otázky o kĺbovej výžive JointBoost. Zloženie, dávkovanie, účinky a ďalšie informácie.',
};

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
  {
    question: 'Má JointBoost nejaké vedľajšie účinky?',
    answer: 'JointBoost je spravidla dobre tolerovaný, ale ako pri každom doplnku, môžu sa vyskytnúť vedľajšie účinky. Ak pocítite akékoľvek nezvyčajné príznaky, poraďte sa s lekárom.'
  },
  {
    question: 'Môžu JointBoost užívať tehotné alebo dojčiace ženy?',
    answer: 'Tehotné alebo dojčiace ženy by nemali užívať tento doplnok stravy.'
  },
  {
    question: 'Je potrebný lekársky predpis na zakúpenie JointBoost?',
    answer: 'Nie, na zakúpenie JointBoost nie je potrebný lekársky predpis, keďže ide o doplnok stravy.'
  },
  {
    question: 'Ako dlho môžem užívať JointBoost?',
    answer: 'JointBoost môžete užívať dlhodobo podľa potreby, avšak odporúča sa pravidelné konzultácie s lekárom ohľadom jeho dlhodobého užívania.'
  }
];

export default function FAQPage() {
  return (
    <main className="py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <FAQSchema faqs={faqs} />
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Často kladené otázky</h1>
            <p className="text-lg text-gray-600">
              Nájdite odpovede na najčastejšie otázky o kĺbovej výžive JointBoost
            </p>
          </header>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Accordion 
                key={index}
                question={faq.question}
                answer={faq.answer}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
} 