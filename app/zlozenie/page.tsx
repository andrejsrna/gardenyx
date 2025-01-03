import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Leaf, TestTube, Brain, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Zloženie JointBoost | Najsilnejšia kĺbová výživa',
  description: 'Objavte prírodné a účinné zloženie našej kĺbovej výživy. Glukozamín, chondroitín, MSM, kolagén a ďalšie aktívne látky pre zdravé kĺby.',
};

const ingredients = [
  {
    name: 'Glukozamín',
    description: 'Glukozamín je populárny doplnok, ktorý je často používaný na podporu zdravia kĺbov. Jeho účinky na kĺby sú predmetom mnohých štúdií a výskumov.',
    image: '/images/ingredients/glukozamin.jpeg',
    slug: 'glukozamin'
  },
  {
    name: 'Chrondoitín',
    description: 'Chondroitín je prirodzenou súčasťou ľudského tela, ktorá hraje kľúčovú úlohu v udržiavaní zdravia a integrity kĺbového tkaniva.',
    image: '/images/ingredients/chondroitin.jpeg',
    slug: 'chondroitin'
  },
  {
    name: 'MSM',
    description: 'Methylsulfonylmethane (MSM) je organická síra, ktorá sa prirodzene vyskytuje v niektorých rastlinách a je známa pre svoje zdravotné benefity, najmä pokiaľ ide o podporu kĺbového zdravia.',
    image: '/images/ingredients/msm.jpeg',
    slug: 'msm'
  },
  {
    name: 'Vitamín C',
    description: 'Vitamín C, známy aj ako kyselina askorbová, je nevyhnutný vitamín, ktorý zohráva kľúčovú úlohu v mnohých aspektoch ľudského zdravia.',
    image: '/images/ingredients/vitamin-c.jpeg',
    slug: 'vitamin-c'
  },
  {
    name: 'Kolagén',
    description: 'Kolagén je jedným z najdôležitejších proteínov v ľudskom tele, hrajúci zásadnú úlohu v mnohých biologických procesoch.',
    image: '/images/ingredients/kolagen.jpeg',
    slug: 'kolagen'
  },
  {
    name: 'Kurkuma',
    description: 'Kurkuma, známa hlavne vďaka svojej aktívnej zložke kurkumín, je tradičným korením s dlhou históriou používania v ayurvédskej a čínskej medicíne.',
    image: '/images/ingredients/kurkuma.jpeg',
    slug: 'kurkuma'
  },
  {
    name: 'Extrakt z čierneho korenia',
    description: 'Čierne korenie, známe aj ako Piper nigrum, je jedno z najpoužívanejších korení na svete a má výraznú chuť a arómu. Zlepšuje absorpciu kurkumy a ostatných zložiek.',
    image: '/images/ingredients/cierne-korenie.jpeg',
    slug: 'cierne-korenie'
  },
  {
    name: 'Kyselina hyaluronová',
    description: 'Kyselina hyalurónová je prirodzená zlúčenina, ktorá sa vyskytuje v ľudskom tele, najmä v koži, očných štrbinách a kĺbovom tkanive. Je známa pre svoje výnimočné hydratačné a regeneračné vlastnosti.',
    image: '/images/ingredients/kyselina-hyaluronova.jpeg',
    slug: 'kyselina-hyaluronova'
  },
  {
    name: 'Boswellia serata',
    description: 'Boswellia serrata, známa tiež ako indický kadidlovník, je cenná rastlina tradične využívaná v ayurvédskej medicíne. Je známa najmä vďaka svojej živice, z ktorej sa vyrába kadidlo.',
    image: '/images/ingredients/boswellia-serata.jpeg',
    slug: 'boswellia'
  }
];

const features = [
  {
    icon: <Leaf className="w-8 h-8" />,
    title: 'Čistota a kvalita',
    description: 'Náš záväzok k prírodným zložkám znamená, že každá kapsula obsahuje len to najlepšie z prírody. Bez umelých farbív, konzervantov či syntetických prísad.'
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: 'Výber najlepších bylín',
    description: 'Starostlivo vybrané byliny a rastlinné extrakty zaručujú maximálnu účinnosť a podporujú zdravie vašich kĺbov. Každá ingrediencia je vybraná pre jej špecifické benefity a synergické účinky.'
  },
  {
    icon: <TestTube className="w-8 h-8" />,
    title: 'Vedecky podložené',
    description: 'V našom zložení sa spája tradičná bylinkárska múdrosť s moderným vedeckým výskumom. Pre vašu istotu a dôveru v naše produkty.'
  },
  {
    icon: <Brain className="w-8 h-8" />,
    title: 'Silné & účinné',
    description: 'Naša "Najsilnejšia kĺbová výživa" ponúka silnú podporu pre vaše kĺby, zlepšuje ich mobilitu a pomáha pri obnove a regenerácii.'
  }
];

export default function CompositionPage() {
  return (
    <main className="py-16">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <header className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold mb-6">
            Objavte silu prírody s &quot;Najsilnejšou kĺbovou výživou&quot;!
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Prírodné, silné, dôveryhodné - To je zloženie našich produktov!
          </p>
          <p className="text-lg text-gray-600">
            Ponorte sa do sveta, kde zdravie a príroda idú ruka v ruke. 
            Objavte zloženie, ktoré robí rozdiel!
          </p>
        </header>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
            >
              <div className="text-green-600 mb-4">
                {feature.icon}
              </div>
              <h3 className="font-bold text-lg mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Ingredients Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 pb-16">
          {ingredients.map((ingredient, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group"
            >
              <div className="aspect-video relative">
                <Image
                  src={ingredient.image}
                  alt={ingredient.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-xl mb-2">
                  {ingredient.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {ingredient.description}
                </p>
                <Link
                  href={`/zlozenie/${ingredient.slug}`}
                  className="inline-flex items-center text-green-600 font-medium hover:text-green-700 transition-colors"
                >
                  Zobraziť viac <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
} 