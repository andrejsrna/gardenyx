'use client';

import { useRef, useState } from 'react';

export interface DocumentRow {
  id: number;
  label: string;
  url: string;
  lang: string;
}

export default function DocumentsEditor({ initial }: { initial: DocumentRow[] }) {
  const [rows, setRows] = useState<DocumentRow[]>(initial);
  const [uploading, setUploading] = useState<Record<number, boolean>>({});
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const add = () =>
    setRows((prev) => [
      ...prev,
      { id: Date.now(), label: 'Bezpečnostný list', url: '', lang: 'sk' },
    ]);

  const remove = (id: number) => setRows((prev) => prev.filter((r) => r.id !== id));

  const update = (id: number, field: keyof DocumentRow, value: string) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));

  const handleUpload = async (id: number, file: File) => {
    setUploading((prev) => ({ ...prev, [id]: true }));
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'documents');
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      update(id, 'url', data.url);
    } catch (err) {
      alert('Upload sa nepodaril: ' + (err instanceof Error ? err.message : 'Neznáma chyba'));
    } finally {
      setUploading((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="space-y-3">
      <input type="hidden" name="documentsJson" value={JSON.stringify(rows)} />

      {rows.length === 0 && (
        <p className="text-sm text-slate-400">Žiadne dokumenty. Klikni &quot;Pridať dokument&quot;.</p>
      )}

      {rows.map((row, idx) => (
        <div key={row.id} className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Dokument #{idx + 1}</span>
            <button type="button" onClick={() => remove(row.id)} className="text-xs text-red-400 hover:text-red-300">
              Odstrániť
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="space-y-1">
              <span className="text-xs text-slate-400">Popis</span>
              <input
                value={row.label}
                onChange={(e) => update(row.id, 'label', e.target.value)}
                placeholder="Bezpečnostný list"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-slate-400">Jazyk</span>
              <select
                value={row.lang}
                onChange={(e) => update(row.id, 'lang', e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="sk">SK</option>
                <option value="en">EN</option>
                <option value="hu">HU</option>
                <option value="all">Všetky</option>
              </select>
            </label>
            <div className="space-y-1">
              <span className="block text-xs text-slate-400">PDF súbor</span>
              <div className="flex gap-2">
                <input
                  value={row.url}
                  onChange={(e) => update(row.id, 'url', e.target.value)}
                  placeholder="https://... alebo nahraj"
                  className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => inputRefs.current[row.id]?.click()}
                  disabled={uploading[row.id]}
                  className="flex-shrink-0 rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 disabled:opacity-50"
                >
                  {uploading[row.id] ? '…' : 'Nahrať'}
                </button>
                <input
                  ref={(el) => { inputRefs.current[row.id] = el; }}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUpload(row.id, f);
                  }}
                />
              </div>
              {row.url && (
                <a href={row.url} target="_blank" rel="noreferrer" className="block truncate text-xs text-emerald-400 hover:text-emerald-300">
                  {row.url}
                </a>
              )}
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="rounded-xl border border-dashed border-emerald-600/50 px-4 py-2 text-sm font-medium text-emerald-400 hover:border-emerald-500 hover:text-emerald-300"
      >
        + Pridať dokument
      </button>
    </div>
  );
}
