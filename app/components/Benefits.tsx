import { 
  Activity, 
  ThumbsUp, 
  Move, 
  Heart, 
  Shield, 
  Droplets, 
  Sparkles, 
  Leaf, 
  ArrowRight,
  Timer,
  Flame,
  Dumbbell
} from 'lucide-react';
import Link from 'next/link';

interface Benefit {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const benefits: Benefit[] = [
  { 
    icon: <Dumbbell className="w-6 h-6" />, 
    title: "Podpora zdravia kĺbov",
    description: "Komplexná formula s glukozamínom a chondroitínom podporuje regeneráciu kĺbovej chrupavky."
  },
  { 
    icon: <Activity className="w-6 h-6" />, 
    title: "Zmiernenie bolesti",
    description: "MSM v kombinácii s protizápalovými zložkami pomáha zmierňovať bolesti kĺbov."
  },
  { 
    icon: <Move className="w-6 h-6" />, 
    title: "Zlepšenie pohyblivosti",
    description: "Aktívne látky podporujú prirodzenú tvorbu synoviálnej tekutiny pre lepšiu flexibilitu kĺbov."
  },
  { 
    icon: <Shield className="w-6 h-6" />, 
    title: "Protizápalové účinky",
    description: "Kurkuma a boswellia serata majú prirodzené protizápalové vlastnosti."
  },
  { 
    icon: <Heart className="w-6 h-6" />, 
    title: "Spomalenie osteoartritídy",
    description: "Kombinácia účinných látok pomáha spomaliť degeneratívne procesy v kĺboch."
  },
  { 
    icon: <Droplets className="w-6 h-6" />, 
    title: "Podpora hydratácie chrupavky",
    description: "Kyselina hyalurónová zlepšuje hydratáciu a výživu kĺbovej chrupavky."
  },
  { 
    icon: <Sparkles className="w-6 h-6" />, 
    title: "Podpora vlasov a nechtov",
    description: "Kolagén a vitamín C podporujú zdravý rast vlasov a nechtov."
  },
  { 
    icon: <ThumbsUp className="w-6 h-6" />, 
    title: "Zlepšenie pružnosti pleti",
    description: "Hydrolyzovaný kolagén pomáha udržiavať pleť pružnú a mladistvú."
  },
  { 
    icon: <Leaf className="w-6 h-6" />, 
    title: "Detoxikačné účinky",
    description: "Prírodné zložky podporujú prirodzené detoxikačné procesy organizmu."
  },
  { 
    icon: <Flame className="w-6 h-6" />, 
    title: "Zlepšenie trávenia",
    description: "Vybrané zložky prispievajú k lepšiemu tráveniu a vstrebávaniu živín."
  },
  { 
    icon: <Timer className="w-6 h-6" />, 
    title: "Anti-aging",
    description: "Antioxidanty a kolagén spomaľujú procesy starnutia v organizme."
  },
  { 
    icon: <Shield className="w-6 h-6" />, 
    title: "Antioxidant",
    description: "Vitamín C a ďalšie zložky chránia bunky pred oxidačným stresom."
  },
];

export default function Benefits() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Účinky najsilnejšej kĺbovej výživy
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Produkt &quot;Najsilnejšia kĺbová výživa, Joint Boost&quot; je prémiový doplnok stravy 
              určený na podporu zdravia kĺbov a zlepšenie ich mobility.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-6 rounded-2xl bg-green-50/50 hover:bg-green-50 transition-colors group"
              >
                <div className="p-3 rounded-xl bg-green-100 text-green-600 group-hover:bg-green-200 transition-colors">
                  {benefit.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Link */}
          <div className="text-center">
            <Link
              href="/zlozenie"
              className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium group"
            >
              Viac o najsilnejšej kĺbovej výžive
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
} 