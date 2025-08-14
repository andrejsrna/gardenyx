import { Package, Tablet } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface IngredientEntry {
  name: string;
  amount: string;
  present: boolean;
}

export interface DisplayProduct {
  name: string;
  price: string;
  discountNote?: string;
  form: string;
  icon: LucideIcon;
  ingredients: IngredientEntry[];
}

export const defaultOurProduct: DisplayProduct = {
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
    { name: 'Vitamín D3', amount: '-', present: false }
  ]
};

export const defaultCompetitors: DisplayProduct[] = [
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
      { name: 'Vitamín D3', amount: '-', present: false }
    ]
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
      { name: 'Boswellia Serrata', amount: '250 mg', present: true }
    ]
  }
];


