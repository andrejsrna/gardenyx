import { getProductsByCategory, getProductsByIds } from '../lib/content';
import RecommendedProducts from './RecommendedProducts';

export default async function RecommendedProductsWrapper() {
  const [heroProduct, ...categoryProductsArrays] = await Promise.all([
    getProductsByIds([824]),
    getProductsByCategory('akciove', 6),
    getProductsByCategory('akciove-produkty', 6)
  ]);

  const categoryProducts = categoryProductsArrays.flat();

  let additionalProducts = categoryProducts;

  // Fallback if category returns empty
  if (additionalProducts.length === 0) {
    // Default IDs from Products.tsx
    additionalProducts = await getProductsByIds([47, 49, 24, 27, 30]);
  }

  // Combine and deduplicate
  const allProducts = [...heroProduct, ...additionalProducts].filter(
    (product, index, self) =>
      index === self.findIndex((p) => p.id === product.id)
  );

  // Take top 4
  const products = allProducts.slice(0, 4);

  return <RecommendedProducts products={products} />;
} 
