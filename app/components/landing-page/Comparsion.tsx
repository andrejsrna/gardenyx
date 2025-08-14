import { CheckCircle2, HelpCircle } from 'lucide-react';
import { defaultOurProduct, defaultCompetitors, DisplayProduct } from './comparisonData';

interface Props {
  products?: DisplayProduct[];
}

const productsToCompareDefault = [defaultOurProduct, ...defaultCompetitors];

export default function Comparsion({ products = productsToCompareDefault }: Props) {
  const allIngredientNames = Array.from(
    new Set(
      products.flatMap((p) => p.ingredients.map((i) => i.name))
    )
  ).sort((a, b) => a.localeCompare(b));

  return (
    <section className="py-16 md:py-24 bg-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
          Ako si stojíme proti konkurencii?
        </h2>

        {/* Desktop Table - Hidden on mobile */}
        <div className="hidden md:block shadow-xl rounded-xl border border-gray-200 bg-white overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border-b border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-4 md:px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider sticky left-0 bg-gray-50 z-10"
                  style={{ minWidth: '160px' }}
                >
                  Zložka
                </th>
                {products.map((product, index) => (
                  <th
                    key={product.name}
                    scope="col"
                    className={`px-4 md:px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider border-l border-gray-200 ${index === 0 ? 'text-green-800 bg-green-50' : 'text-gray-600 bg-gray-50'}`}
                    style={{ minWidth: '120px' }}
                  >
                    <div className="flex flex-col items-center">
                      <product.icon className={`w-6 h-6 mb-1 ${index === 0 ? 'text-green-600' : 'text-gray-400'}`} />
                      {product.name}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {allIngredientNames.map((ingredientName, idx) => {
                const isEven = idx % 2 === 0;
                return (
                  <tr key={ingredientName} className={isEven ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className={`px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 sticky left-0 z-10 ${isEven ? 'bg-white' : 'bg-gray-50/50'}`}>
                      {ingredientName}
                    </td>
                    {products.map((product, productIndex) => {
                      const ingredient = product.ingredients.find(i => i.name === ingredientName);
                      return (
                        <td
                          key={`${product.name}-${ingredientName}`}
                          className={`px-4 md:px-6 py-5 whitespace-nowrap text-sm text-center border-l border-gray-200 ${productIndex === 0 ? (isEven ? 'bg-green-50/30' : 'bg-green-50/50') : ''}`}
                        >
                          {ingredient?.present ? (
                            <div className="flex flex-col items-center justify-center min-h-[40px]">
                              <CheckCircle2 className={`w-${productIndex === 0 ? '6' : '5'} h-${productIndex === 0 ? '6' : '5'} ${productIndex === 0 ? 'text-green-600' : 'text-gray-500'} mb-0.5`} />
                              <span className={`${productIndex === 0 ? 'text-gray-900 font-semibold' : 'text-gray-700'} text-xs`}>{ingredient.amount}</span>
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
                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700 sticky left-0 bg-gray-100 z-10">Forma produktu</td>
                {products.map((product, productIndex) => (
                  <td
                    key={`${product.name}-form`}
                    className={`px-4 md:px-6 py-4 whitespace-nowrap text-sm text-center border-l border-gray-200 ${productIndex === 0 ? 'font-medium bg-green-50/30' : ''}`}
                  >
                    {product.form}
                  </td>
                ))}
              </tr>
              <tr className="bg-gray-100">
                <td className="px-4 md:px-6 py-4 text-sm font-semibold text-gray-700 sticky left-0 bg-gray-100 z-10">Cena</td>
                {products.map((product, productIndex) => (
                  <td
                    key={`${product.name}-price`}
                    className={`px-4 md:px-6 py-4 text-sm text-center border-l border-gray-200 ${productIndex === 0 ? 'bg-green-50/30' : ''}`}
                  >
                    <div className={`${productIndex === 0 ? 'text-green-700 font-bold' : 'font-medium'}`}>{product.price}</div>
                    {product.discountNote && (
                      <div className="text-xs text-gray-500 mt-1">({product.discountNote})</div>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Mobile Cards - Hidden on medium+ */}
        <div className="block md:hidden space-y-8">
          {products.map((product, productIndex) => (
            <div key={product.name} className={`rounded-xl shadow-lg border ${productIndex === 0 ? 'border-green-300 bg-green-50/30' : 'border-gray-200 bg-white'}`}>
              {/* Card Header */}
              <div className={`p-4 rounded-t-xl ${productIndex === 0 ? 'bg-green-100' : 'bg-gray-50'} border-b ${productIndex === 0 ? 'border-green-200' : 'border-gray-200'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <product.icon className={`w-6 h-6 ${productIndex === 0 ? 'text-green-600' : 'text-gray-500'}`} />
                  <h3 className={`text-lg font-bold ${productIndex === 0 ? 'text-green-800' : 'text-gray-800'}`}>{product.name}</h3>
                </div>
                <div className="flex justify-between items-baseline text-sm">
                  <span className="font-medium text-gray-700">Forma: {product.form}</span>
                  <div className={`${productIndex === 0 ? 'text-green-700 font-bold' : 'font-medium'}`}>{product.price}</div>
                </div>
                {product.discountNote && (
                  <div className="text-xs text-gray-500 mt-1 text-right">({product.discountNote})</div>
                )}
              </div>
              {/* Card Body - Ingredients List */}
              <div className="p-4 space-y-3">
                {allIngredientNames.map((ingredientName) => {
                  const ingredient = product.ingredients.find(i => i.name === ingredientName);
                  return (
                    <div key={ingredientName} className="flex justify-between items-center text-sm border-b border-dashed border-gray-200 pb-2 last:border-b-0">
                      <span className="text-gray-700 mr-2">{ingredientName}</span>
                      {ingredient?.present ? (
                        <span className={`font-medium text-right ${productIndex === 0 ? 'text-green-700' : 'text-gray-800'}`}>{ingredient.amount}</span>
                      ) : (
                        <HelpCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-500 text-center mt-8">
          *Údaje o konkurenčných produktoch boli získané z verejne dostupných zdrojov dňa 20.04.2025 a nemusia byť úplne presné alebo aktuálne.
          Údaje pre Konkurenta A sú pre dennú dávku (2,25g), pre Konkurenta B pre 1 tabletu.
          Ceny sú orientačné a môžu sa líšiť.
        </p>
      </div>
    </section>
  );
}
