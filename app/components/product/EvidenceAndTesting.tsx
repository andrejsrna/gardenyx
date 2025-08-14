export default function EvidenceAndTesting() {
  const sources = [
    {
      title: 'Glukozamín a chondroitín pri osteoartritíde: systematický prehľad a meta-analýza',
      url: 'https://pubmed.ncbi.nlm.nih.gov/12837042/',
      summary: 'Meta‑analýza naznačuje mierne zníženie bolesti a zlepšenie funkcie u časti pacientov s osteoartritídou.'
    },
    {
      title: 'Extrakt Boswellia serrata pri osteoartritíde: randomizovaná, dvojito zaslepená, placebom kontrolovaná štúdia',
      url: 'https://pubmed.ncbi.nlm.nih.gov/17035153/',
      summary: 'Významné zlepšenie bolesti a funkcie kĺbov oproti placebu už po niekoľkých týždňoch užívania.'
    },
    {
      title: 'Metylsulfonylmetán (MSM) pri bolesti pri osteoartritíde: randomizovaná klinická štúdia',
      url: 'https://pubmed.ncbi.nlm.nih.gov/16309928/',
      summary: 'MSM viedol k zníženiu bolesti a zlepšeniu funkcie kolena v porovnaní s placebom.'
    },
    {
      title: 'Kurkumín s piperínom: výrazné zvýšenie biologickej dostupnosti u ľudí',
      url: 'https://pubmed.ncbi.nlm.nih.gov/9619120/',
      summary: 'Piperín zvýšil biologickú dostupnosť kurkumínu približne o 2000 %, čo môže zlepšiť jeho účinok.'
    },
    {
      title: 'Hydrolyzovaný kolagén u športovcov s bolesťou kĺbov: 24‑týždňová štúdia',
      url: 'https://pubmed.ncbi.nlm.nih.gov/18416885/',
      summary: 'Dlhodobé užívanie znížilo subjektívnu bolesť kĺbov u športovcov oproti placebu.'
    },
    {
      title: 'Nedenaturovaný kolagén typu II (UC‑II) pri bolestiach kolena: multicentrická RCT',
      url: 'https://pubmed.ncbi.nlm.nih.gov/26746199/',
      summary: 'UC‑II preukázal zlepšenie skóre bolesti a funkcie kolena, v niektorých ukazovateľoch lepší ako glukozamín/chondroitín.'
    }
  ];
  return (
    <section className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Zdroje a kvalita</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <ul className="space-y-3 text-gray-700">
          {sources.map((s) => (
            <li key={s.title}>
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-green-700 underline">
                {s.title}
              </a>
              {s.summary && (
                <div className="text-sm text-gray-600 mt-1">{s.summary}</div>
              )}
            </li>
          ))}
        </ul>
        <div className="text-gray-700">
          <div className="font-semibold text-gray-900 mb-2">Kontrola a deklarácia</div>
          <p>Certifikované RÚVZ. Transparentná deklarácia zloženia a dávkovania.</p>
        </div>
      </div>
    </section>
  );
}


