'use client';

const subject = 'Ako sa dnes majú tvoje kĺby?';
const bodyLines = [
  'Ahoj {{first_name}}, je to už nejaký čas, odkedy si u nás nakúpil/a – len jemne sa pýtame: ako sa dnes majú tvoje kĺby?',
  'Žiadny predaj, žiadna povinnosť odpovedať — len úprimný záujem.',
  'Každé telo reaguje inak; je ok cítiť úľavu hneď aj neskôr.',
  'Často sa kĺby ozvú pri zmene počasia, po pauze v pohybe alebo keď starostlivosť vypadne z rutiny.',
  '👉 Máme pre teba jednoduchý tip, ktorý pomáha udržať kĺby v pohode — aj bez nákupov.',
];

export default function ReactivationPreview() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">Preview</p>
      <p className="mt-1 text-sm font-semibold text-white">{subject}</p>
      <div className="mt-3 space-y-2 rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-sm text-slate-200 shadow-inner shadow-slate-900/50">
        {bodyLines.map((line, idx) => (
          <p key={idx} className="leading-relaxed">
            {line}
          </p>
        ))}
        <button
          type="button"
          className="mt-3 inline-flex items-center gap-2 rounded-lg border border-emerald-400/70 bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-900 shadow-md shadow-emerald-900/30"
        >
          Máme pre teba tip
        </button>
        <p className="text-xs text-slate-400">CTA vedie na blog/care tip (nie na produkt).</p>
      </div>
    </div>
  );
}
