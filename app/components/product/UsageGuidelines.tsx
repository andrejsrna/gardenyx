export default function UsageGuidelines() {
  return (
    <section className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Užívanie a dávkovanie</h2>
      <div className="grid md:grid-cols-3 gap-6 text-gray-700">
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Ako užívať</h3>
          <ul className="space-y-2 list-disc list-inside">
            <li>1 kapsula denne s jedlom a vodou</li>
            <li>Užívať v približne rovnakom čase</li>
            <li>Dlhodobo minimálne 8–12 týždňov</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Kedy uvidím výsledky</h3>
          <ul className="space-y-2 list-disc list-inside">
            <li>Prvé zmeny zvyčajne po 2–4 týždňoch</li>
            <li>Stabilné účinky po 8–12 týždňoch</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Tipy</h3>
          <ul className="space-y-2 list-disc list-inside">
            <li>Kombinovať s pravidelným pohybom a hydratáciou</li>
            <li>Neprestať s odporúčanou rehabilitáciou</li>
            <li>Možné kombinovať s kolagénom a vitamínom C</li>
          </ul>
        </div>
      </div>
    </section>
  );
}


