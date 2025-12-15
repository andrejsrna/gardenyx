import Reviews from '@/app/components/Reviews';
import ReviewForm from './ReviewForm';

export const metadata = {
  title: 'Recenzie zákazníkov | Najsilnejšia kĺbová výživa',
  description: 'Skúsenosti a hodnotenia zákazníkov s Najsilnejšou kĺbovou výživou. Pridajte svoju recenziu a získajte kupón na ďalší nákup.',
  alternates: {
    canonical: 'https://najsilnejsiaklbovavyziva.sk/recenzie'
  }
};

export default function RecenziePage() {
  return (
    <main className="bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-green-700 font-semibold mb-4">Skúsenosti zákazníkov</p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Čo hovoria ľudia o Najsilnejšej kĺbovej výžive</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Reálne hodnotenia ľudí, ktorí s nami riešia bolesť a pohyblivosť kĺbov. Podeľte sa o vlastnú skúsenosť – po zverejnení vám pošleme kupón na ďalší nákup.
          </p>
          <div className="mt-6 inline-flex items-center gap-3 bg-white shadow-lg shadow-green-100/60 border border-green-100 rounded-2xl px-4 py-3">
            <span className="text-sm font-semibold text-gray-800">⭐ 4.9/5</span>
            <span className="text-sm text-gray-500">overené spätnou väzbou zákazníkov</span>
          </div>
        </div>
      </section>

      <section className="pb-16 md:pb-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <ReviewForm />
        </div>
      </section>

      <Reviews />
    </main>
  );
}
