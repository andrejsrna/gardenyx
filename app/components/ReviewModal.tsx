import { Star } from 'lucide-react';
import { useState } from 'react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (review: {
    author: { name: string; initials: string };
    rating: number;
    content: string;
  }) => void;
}

export default function ReviewModal({ isOpen, onClose }: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !content) {
      setError('Prosím vyplňte všetky polia');
      return;
    }

    // Create email content
    const subject = `Nová recenzia od ${name}`;
    const body = `Meno: ${name}
Hodnotenie: ${'★'.repeat(rating)}${'☆'.repeat(5-rating)}

Recenzia:
${content}`;

    window.location.href = `mailto:info@fitdoplnky.sk?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;;

    setName('');
    setContent('');
    setRating(5);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6">
        <h3 className="text-2xl font-bold mb-4">Pridať recenziu</h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hodnotenie
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vaše meno
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
              placeholder="Zadajte vaše meno"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vaša recenzia
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg h-32 resize-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
              placeholder="Napíšte vašu recenziu"
            />
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              Odoslať email
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Zrušiť
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
