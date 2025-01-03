import { getProductsByCategory } from '../lib/wordpress';
import RecommendedProducts from './RecommendedProducts';

export default async function RecommendedProductsWrapper() {
  const products = await getProductsByCategory('akciove', 4);
  return <RecommendedProducts products={products} />;
} 