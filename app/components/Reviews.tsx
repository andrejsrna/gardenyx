'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

interface Review {
  id: string;
  author: {
    name: string;
    initials: string;
  };
  rating: number;
  date: string;
  content: string;
}

const defaultReviews: Review[] = [
  {
    id: '1',
    author: { name: 'Lucia Králiková', initials: 'LK' },
    rating: 4,
    date: '30 novembra, 2023',
    content: 'Objednávka prišla rýchlo, zatiaľ spokojnosť.'
  },
  {
    id: '2',
    author: { name: 'Igor Tóth', initials: 'IT' },
    rating: 5,
    date: '25 novembra, 2023',
    content: 'Výborný produkt, odporúčam všetkým.'
  },
  {
    id: '3',
    author: { name: 'Peter Kováč', initials: 'PK' },
    rating: 5,
    date: '15 novembra, 2023',
    content: 'Funguje výborne, cítim sa oveľa lepšie.'
  },
  {
    id: '4',
    author: { name: 'Eva Horváthová', initials: 'EH' },
    rating: 5,
    date: '10 novembra, 2023',
    content: 'Veľmi účinné, bolesť ustúpila už po týždni!'
  },
  {
    id: '5',
    author: { name: 'Ján Novák', initials: 'JN' },
    rating: 5,
    date: '1 novembra, 2023',
    content: 'Najlepšia kĺbová výživa, akú som kedy vyskúšal!'
  }
];

// Optimized StarRating component using Unicode characters
const StarRating = ({ rating }: { rating: number }) => {
  // Round rating to nearest half for potential half-star display (optional)
  const roundedRating = Math.round(rating * 2) / 2;
  return (
    <div className="flex items-center" aria-label={`Hodnotenie: ${rating} z 5 hviezdičiek`}>
      {[1, 2, 3, 4, 5].map((starValue) => (
        <span
          key={starValue}
          className={`text-xl leading-none ${ // Adjusted size and line-height
            starValue <= roundedRating
              ? 'text-yellow-400' // Filled star color
              : 'text-gray-300' // Empty star color
          }`}
          aria-hidden="true" // Hide decorative stars from screen readers
        >
          ★
        </span>
      ))}
    </div>
  );
};

// Dynamically import ReviewModal
const DynamicReviewModal = dynamic(
  () => import('./ReviewModal'),
  { ssr: false }
);

export default function Reviews() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const averageRating = Number(
    (defaultReviews.reduce((acc, review) => acc + review.rating, 0) / defaultReviews.length).toFixed(1)
  );

  const ratingCounts = defaultReviews.reduce((acc, review) => {
    acc[review.rating] = (acc[review.rating] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const ratingPercentages = {
    5: (ratingCounts[5] || 0) / defaultReviews.length * 100 || 0,
    4: (ratingCounts[4] || 0) / defaultReviews.length * 100 || 0,
    3: (ratingCounts[3] || 0) / defaultReviews.length * 100 || 0,
    2: (ratingCounts[2] || 0) / defaultReviews.length * 100 || 0,
    1: (ratingCounts[1] || 0) / defaultReviews.length * 100 || 0,
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Skúsenosti zákaznikov
            </h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-block bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition-colors"
            >
              Pridať recenziu
            </button>
          </div>

          <div className="grid md:grid-cols-12 gap-8">
            {/* Rating Summary */}
            <div className="md:col-span-4">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-center">
                  <div className="text-5xl font-bold text-gray-900 mb-2">{averageRating}</div>
                  <StarRating rating={averageRating} />
                  <div className="text-sm text-gray-500 mt-4">
                    Založené na {defaultReviews.length} hodnoteniach
                  </div>
                </div>

                <div className="space-y-2 mt-6">
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <div key={stars} className="flex items-center gap-3">
                      <div className="text-sm text-gray-600 w-16 flex items-center">
                        {stars} <span className="ml-1 text-yellow-400">★</span>
                      </div>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400"
                          style={{ width: `${ratingPercentages[stars as keyof typeof ratingPercentages]}%` }}
                        />
                      </div>
                      <div className="text-sm text-gray-600 w-8">
                        {Math.round(ratingPercentages[stars as keyof typeof ratingPercentages])}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Reviews List */}
            <div className="md:col-span-8">
              <div className="space-y-4">
                {defaultReviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-green-600 font-medium">{review.author.initials}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-medium text-gray-900">{review.author.name}</div>
                            <div className="text-sm text-gray-500">{review.date}</div>
                          </div>
                          <StarRating rating={review.rating} />
                        </div>
                        <p className="text-gray-600">{review.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Use the dynamically imported modal */}
      {/* Render the modal only when isModalOpen is true to avoid loading it unnecessarily before interaction */}
      {isModalOpen && (
        <DynamicReviewModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={() => { /* Handle submit if needed */ }}
        />
      )}
    </section>
  );
}
