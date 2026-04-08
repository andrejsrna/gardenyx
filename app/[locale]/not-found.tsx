import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg text-center">
        <p className="text-7xl font-bold text-green-600 mb-4">404</p>
        <h1 className="text-2xl font-semibold text-gray-900 mb-3">
          Stránka nenájdená
        </h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Stránka, ktorú hľadáte, neexistuje alebo bola presunutá.
        </p>
        <Link
          href="/"
          className="inline-block rounded-full bg-green-600 px-6 py-3 text-sm font-medium text-white hover:bg-green-700 transition-colors"
        >
          Späť na hlavnú stránku
        </Link>
      </div>
    </main>
  );
}
