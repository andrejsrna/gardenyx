export default function Suitability() {
  return (
    <section className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Pre koho áno/nie</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Pre koho</h3>
          <ul className="space-y-2 list-disc list-inside text-gray-700">
            <li>Aktívni ľudia a šport</li>
            <li>Sedavé povolanie a stuhnutosť</li>
            <li>Regenerácia po záťaži</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Kedy neužívať</h3>
          <ul className="space-y-2 list-disc list-inside text-gray-700">
            <li>Pri alergii na ktorúkoľvek zložku</li>
            <li>Pri zdravotných ťažkostiach konzultovať s lekárom</li>
            <li>Tehotenstvo a dojčenie konzultovať s lekárom</li>
          </ul>
        </div>
      </div>
    </section>
  );
}


