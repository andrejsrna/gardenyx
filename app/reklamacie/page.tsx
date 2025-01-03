import { Phone, Mail, Clock, Package } from 'lucide-react';

const steps = [
  {
    icon: <Mail className="w-6 h-6" />,
    title: 'Kontaktujte nás',
    description: 'Napíšte nám na info@fitdoplnky.sk alebo zavolajte na +421 914 230 321.'
  },
  {
    icon: <Package className="w-6 h-6" />,
    title: 'Pošlite tovar',
    description: 'Zašlite nám tovar späť spolu s kópiou faktúry a opisom problému.'
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: 'Spracovanie',
    description: 'Reklamáciu vybavíme najneskôr do 30 dní, vrátenie peňazí do 14 dní.'
  }
];

export default function ReklamaciePage() {
  return (
    <main className="py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Zásady vrátenia peňazí a reklamácií</h1>

          <div className="bg-green-50 rounded-2xl p-6 mb-12">
            <p>
              V e-shope <strong>najsilnejsiaklbovavyziva.sk</strong> (resp. <strong>fitdoplnky.sk</strong>)
              si ceníme spokojnosť našich zákazníkov. Ak ste z akéhokoľvek dôvodu nespokojní 
              s objednaným tovarom, ponúkame vám možnosti reklamácie alebo vrátenia tovaru 
              v súlade s príslušnými právnymi predpismi.
            </p>
          </div>

          {/* Postup vybavenia reklamácie (kroky) */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {steps.map((step, index) => (
              <div 
                key={index}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
              >
                <div className="text-green-600 mb-4">
                  {step.icon}
                </div>
                <h3 className="font-bold text-lg mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          {/* Reklamácie Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Reklamácie</h2>
            <div className="bg-white p-8 rounded-2xl border border-gray-100">
              <p className="mb-4">
                Ak sa vyskytne problém s kúpeným tovarom (napr. poškodený, nesprávny 
                alebo nefunkčný), máte právo podať reklamáciu v záručnej dobe 
                (spravidla 24 mesiacov od dátumu prevzatia). 
              </p>
              <p className="mb-4 text-gray-600">
                Reklamáciu uplatníte tak, že nás kontaktujete (e-mailom alebo telefonicky) 
                a následne zašlete tovar späť spolu s kópiou faktúry a popisom problému. 
                Reklamáciu vybavíme čo najskôr, najneskôr však do 30 dní odo dňa jej uplatnenia. 
                O stave vybavenia reklamácie vás budeme informovať e-mailom alebo telefonicky.
              </p>
              <p className="text-sm text-gray-500">
                Pokiaľ reklamáciu nemožno vybaviť v uvedenej lehote, máte právo požadovať 
                vrátenie kúpnej ceny alebo výmenu tovaru za nový.
              </p>
            </div>
          </section>

          {/* Vrátenie tovaru Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Vrátenie tovaru (odstúpenie od zmluvy)</h2>
            <div className="bg-white p-8 rounded-2xl border border-gray-100">
              <p className="mb-4">
                Ak ste spotrebiteľ (fyzická osoba nekonajúca v rámci podnikania), 
                máte podľa zákona č. 102/2014 Z. z. právo odstúpiť od kúpnej zmluvy 
                bez udania dôvodu do 14 dní od prevzatia tovaru. Na uplatnenie tohto práva 
                je potrebné, aby bol tovar nepoškodený a nenesúci známky nadmerného opotrebovania. 
                Môže byť primerane rozbalený a vyskúšaný na zistenie vlastností, 
                avšak v rozsahu, v akom by ste si ho mohli prezrieť v kamennej predajni.
              </p>
              <p className="mb-4 text-gray-600">
                Ak sa rozhodnete využiť právo na odstúpenie, zašlite nám, prosím, 
                vyplnené oznámenie o odstúpení od zmluvy (prípadne iný jednoznačný prejav vôle) 
                a tovar späť. Náklady na vrátenie tovaru znáša kupujúci, 
                pokiaľ sa nejedná o chybu z našej strany. Peniaze za vrátený tovar vám 
                poukážeme na váš účet najneskôr do 14 dní odo dňa doručenia oznámenia o odstúpení, 
                nie však pred tým, ako obdržíme vrátený tovar alebo doklad o jeho odoslaní.
              </p>
              <p className="text-sm text-gray-500">
                Pri tovare, ktorý sa vráti poškodený alebo znehodnotený, 
                môže byť hodnota vrátených peňazí primerane znížená o škodu 
                spôsobenú kupujúcim.
              </p>
            </div>
          </section>

          {/* Contact Section */}
          <section className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-6">Kontakt</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Email</h3>
                  <a 
                    href="mailto:info@fitdoplnky.sk" 
                    className="text-green-600 hover:text-green-700 transition-colors"
                  >
                    info@fitdoplnky.sk
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Telefón</h3>
                  <a 
                    href="tel:+421914230321" 
                    className="text-green-600 hover:text-green-700 transition-colors"
                  >
                    +421 914 230 321
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
