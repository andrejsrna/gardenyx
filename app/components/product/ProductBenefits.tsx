export default function ProductBenefits() {
  const benefits = [
    'Podpora pohyblivosti pri záťaži a po nej',
    'Doplnenie kľúčových látok pre chrupavky a šľachy',
    'Jednoduché dávkovanie 1 kapsula denne',
    'Bez zbytočných prísad',
    'Vhodné na dlhodobé užívanie',
    'Synergická kombinácia zložiek',
    'Transparentná deklarácia zloženia'
  ];
  return (
    <section className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Prečo toto riešenie</h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-disc list-inside text-gray-700">
        {benefits.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
    </section>
  );
}


