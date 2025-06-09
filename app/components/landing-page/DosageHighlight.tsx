import Image from 'next/image';

export default function DosageHighlight() {
  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 via-white to-green-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-green-100 rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-emerald-100 rounded-full opacity-30 blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Jednoduché a efektívne dávkovanie
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Jeden produkt, jednoduché užívanie, maximálny účinok na vaše kĺby
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Product Image */}
            <div className="relative order-2 lg:order-1">
              <div className="relative w-full max-w-md mx-auto">
                <Image
                  src="/product-image.png"
                  alt="Joint Boost - kĺbová výživa"
                  width={400}
                  height={400}
                  className="object-contain drop-shadow-2xl"
                  priority
                />
                {/* Floating badge */}
                <div className="absolute -top-4 -right-4 bg-green-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                  30 dní
                </div>
              </div>
            </div>

            {/* Dosage Info */}
            <div className="order-1 lg:order-2">
              <div className="grid gap-6">
                {/* 30 tabliet */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-bold text-white">30</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Tabliet v balení</h3>
                      <p className="text-gray-600 text-sm">
                        Kompletné balenie na celý mesiac užívania
                      </p>
                    </div>
                  </div>
                </div>

                {/* 1 tableta denne */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-bold text-white">1</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Tableta denne</h3>
                      <p className="text-gray-600 text-sm">
                        Jednoduché dávkovanie bez komplikácií
                      </p>
                    </div>
                  </div>
                </div>

                {/* Jednoduché užívanie */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Jednoduché užívanie</h3>
                      <p className="text-gray-600 text-sm">
                        Berieme ráno s jedlom pre najlepšiu absorpciu
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Value proposition */}
              <div className="mt-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-lg">💡</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Výhodné balenie</h4>
                    <p className="text-green-100">
                      Len 0,50 € za deň pre zdravé kĺby
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 