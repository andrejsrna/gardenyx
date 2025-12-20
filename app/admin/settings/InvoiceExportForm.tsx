/* Client component to trigger invoice export for a selected month/year. */
'use client';

import { useMemo, useState } from 'react';

const months = [
  { value: 1, label: 'Január' },
  { value: 2, label: 'Február' },
  { value: 3, label: 'Marec' },
  { value: 4, label: 'Apríl' },
  { value: 5, label: 'Máj' },
  { value: 6, label: 'Jún' },
  { value: 7, label: 'Júl' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'Október' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' }
];

export default function InvoiceExportForm() {
  const now = useMemo(() => new Date(), []);
  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const [year, setYear] = useState<number>(now.getFullYear());

  const years = useMemo(() => {
    const current = now.getFullYear();
    return Array.from({ length: 5 }, (_, i) => current - i);
  }, [now]);

  const handleExport = () => {
    if (!month || !year) return;
    const url = `/api/admin/invoices/export?year=${year}&month=${month}`;
    window.location.href = url;
  };

  const handleExportZip = () => {
    if (!month || !year) return;
    const url = `/api/admin/invoices/export-zip?year=${year}&month=${month}`;
    window.location.href = url;
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400 block mb-1">Mesiac</label>
          <select
            value={month}
            onChange={e => setMonth(Number(e.target.value))}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-white"
          >
            {months.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-xs uppercase tracking-[0.2em] text-slate-400 block mb-1">Rok</label>
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-white"
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
        >
          Stiahnuť CSV s faktúrami
        </button>
        <button
          type="button"
          onClick={handleExportZip}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 transition"
        >
          Stiahnuť ZIP s PDF
        </button>
      </div>
      <p className="text-xs text-slate-400">Export obsahuje číslo objednávky, číslo faktúry a URL faktúry za zvolený mesiac/rok. ZIP stiahne všetky PDF.</p>
    </div>
  );
}
