import { CheckCircle2, HelpCircle, Package, Tablet } from 'lucide-react';

const ourProduct = {
  name: 'Joint Boost',
  price: '14,99 €',
  discountNote: 'Množstevná zľava dostupná',
  form: 'Tablety',
  icon: Tablet,
  ingredients: [
    { name: 'Glukozamín', amount: '200 mg', present: true },
    { name: 'Chondroitín', amount: '100 mg', present: true },
    { name: 'MSM', amount: '100 mg', present: true },
    { name: 'Vitamín C', amount: '40 mg', present: true },
    { name: 'Kolagén (Typ II)', amount: '40 mg', present: true },
    { name: 'Kurkuma', amount: '10 mg', present: true },
    { name: 'Čierne korenie (Piperín)', amount: '5 mg', present: true },
    { name: 'Kyselina hyalurónová', amount: '10 mg', present: true },
    { name: 'Boswellia Serrata', amount: '5 mg', present: true },
    { name: 'Kolagén (Typ I)', amount: '-', present: false },
    { name: 'Extrakt z boswéllie', amount: '5 mg', present: true },
    { name: 'Extrakt z rebríčka obyčajného', amount: '-', present: false },
    { name: 'Natívny kolagén typu II', amount: '-', present: false },
    { name: 'Vitamín K1', amount: '-', present: false },
    { name: 'Vitamín D3', amount: '-', present: false },
  ],
};

const competitors = [
  {
    name: 'Konkurent A',
    price: '53,67 €',
    discountNote: '',
    form: 'Prášok',
    icon: Package,
    ingredients: [
      { name: 'MSM', amount: '979 mg', present: true },
      { name: 'Glukozamín', amount: '782,5 mg', present: true },
      { name: 'Chondroitín', amount: '326 mg', present: true },
      { name: 'Kolagén (Typ II)', amount: '11,25 mg', present: true },
      { name: 'Kolagén (Typ I)', amount: '7,5 mg', present: true },
      { name: 'Vitamín C', amount: '9,65 mg', present: true },
      { name: 'Kurkuma', amount: '-', present: false },
      { name: 'Čierne korenie (Piperín)', amount: '-', present: false },
      { name: 'Kyselina hyalurónová', amount: '-', present: false },
      { name: 'Boswellia Serrata', amount: '-', present: false },
      { name: 'Extrakt z boswéllie', amount: '-', present: false },
      { name: 'Extrakt z rebríčka obyčajného', amount: '-', present: false },
      { name: 'Natívny kolagén typu II', amount: '-', present: false },
      { name: 'Vitamín K1', amount: '-', present: false },
      { name: 'Vitamín D3', amount: '-', present: false },
    ],
  },
  {
    name: 'Konkurent B',
    price: '14,65 €',
    discountNote: '',
    form: 'Tablety',
    icon: Tablet,
    ingredients: [
      { name: 'Extrakt z boswéllie', amount: '250 mg', present: true },
      { name: 'Extrakt z rebríčka obyčajného', amount: '30 mg', present: true },
      { name: 'Kolagén (Typ I)', amount: '20 mg', present: true },
      { name: 'Kolagén (Typ II)', amount: '20 mg', present: true },
      { name: 'Natívny kolagén typu II', amount: '40 μg', present: true },
      { name: 'Vitamín C', amount: '20 mg', present: true },
      { name: 'Vitamín K1', amount: '101 μg', present: true },
      { name: 'Vitamín D3', amount: '4,5 μg', present: true },
      { name: 'Glukozamín', amount: '-', present: false },
      { name: 'Chondroitín', amount: '-', present: false },
      { name: 'MSM', amount: '-', present: false },
      { name: 'Kurkuma', amount: '-', present: false },
      { name: 'Čierne korenie (Piperín)', amount: '-', present: false },
      { name: 'Kyselina hyalurónová', amount: '-', present: false },
      { name: 'Boswellia Serrata', amount: '250 mg', present: true },
    ],
  },
];

export default function Comparsion() {
  const allIngredientNames = Array.from(
    new Set([
      ...ourProduct.ingredients.map((i) => i.name),
      ...competitors.flatMap((c) => c.ingredients.map((i) => i.name)),
    ])
  ).sort((a, b) => a.localeCompare(b));

  return (
    <section className="py-16 md:py-24 bg-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
          Ako si stojíme proti konkurencii?
        </h2>
        <div className="shadow-xl rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border-b border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider sticky left-0 bg-gray-50 z-10"
                    style={{ minWidth: '180px' }}
                  >
                    Zložka
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-center text-sm font-semibold text-green-800 uppercase tracking-wider border-l border-gray-200 bg-green-50"
                    style={{ minWidth: '140px' }}
                  >
                    <div className="flex flex-col items-center">
                      <ourProduct.icon className="w-6 h-6 mb-1 text-green-600" />
                      {ourProduct.name}
                    </div>
                  </th>
                  {competitors.map((comp) => (
                    <th
                      key={comp.name}
                      scope="col"
                      className="px-6 py-4 text-center text-sm font-semibold text-gray-600 uppercase tracking-wider border-l border-gray-200"
                      style={{ minWidth: '140px' }}
                    >
                      <div className="flex flex-col items-center">
                        <comp.icon className="w-5 h-5 mb-1 text-gray-400" />
                        {comp.name}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {allIngredientNames.map((ingredientName, index) => {
                  const ourIngredient = ourProduct.ingredients.find(
                    (i) => i.name === ingredientName
                  );
                  const isEven = index % 2 === 0;

                  return (
                    <tr key={ingredientName} className={isEven ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 sticky left-0 z-10 ${isEven ? 'bg-white' : 'bg-gray-50/50'}`}>
                        {ingredientName}
                      </td>
                      <td className={`px-6 py-5 whitespace-nowrap text-sm text-center border-l border-gray-200 ${isEven ? 'bg-green-50/30' : 'bg-green-50/50'}`}>
                        {ourIngredient?.present ? (
                          <div className="flex flex-col items-center justify-center min-h-[40px]">
                            <CheckCircle2 className="w-6 h-6 text-green-600 mb-0.5" />
                            <span className="text-gray-900 font-semibold text-xs">{ourIngredient.amount}</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center min-h-[40px]">
                            <HelpCircle className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </td>
                      {competitors.map((comp) => {
                        const competitorIngredient = comp.ingredients.find(
                          (i) => i.name === ingredientName
                        );
                        return (
                          <td
                            key={`${comp.name}-${ingredientName}`}
                            className="px-6 py-5 whitespace-nowrap text-sm text-center border-l border-gray-200"
                          >
                            {competitorIngredient?.present ? (
                              <div className="flex flex-col items-center justify-center min-h-[40px]">
                                <CheckCircle2 className="w-5 h-5 text-gray-500 mb-0.5" />
                                <span className="text-gray-700 text-xs">{competitorIngredient.amount}</span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center min-h-[40px]">
                                <HelpCircle className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                <tr className="bg-gray-100">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700 sticky left-0 bg-gray-100 z-10">Forma produktu</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center border-l border-gray-200 bg-green-50/30">
                    {ourProduct.form}
                  </td>
                  {competitors.map((comp) => (
                    <td
                      key={`${comp.name}-form`}
                      className="px-6 py-4 whitespace-nowrap text-sm text-center border-l border-gray-200"
                    >
                      {comp.form}
                    </td>
                  ))}
                </tr>
                <tr className="bg-gray-100">
                  <td className="px-6 py-4 text-sm font-semibold text-gray-700 sticky left-0 bg-gray-100 z-10">Cena</td>
                  <td className="px-6 py-4 text-sm text-center border-l border-gray-200 bg-green-50/30">
                    <div className="text-green-700 font-bold">{ourProduct.price}</div>
                    {ourProduct.discountNote && (
                      <div className="text-xs text-gray-500 mt-1">({ourProduct.discountNote})</div>
                    )}
                  </td>
                  {competitors.map((comp) => (
                    <td
                      key={`${comp.name}-price`}
                      className="px-6 py-4 text-sm text-center border-l border-gray-200"
                    >
                      <div className="font-medium">{comp.price}</div>
                      {comp.discountNote && (
                        <div className="text-xs text-gray-500 mt-1">({comp.discountNote})</div>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 text-center mt-6">
            *Údaje o konkurenčných produktoch boli získané z verejne dostupných zdrojov dňa [Dátum] a nemusia byť úplne presné alebo aktuálne.
            Údaje pre Konkurenta A sú pre dennú dávku (2,25g), pre Konkurenta B pre 1 tabletu.
            Ceny sú orientačné a môžu sa líšiť.
          </p>
        </div>
      </div>
    </section>
  );
}
