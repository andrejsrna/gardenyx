'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  name: string;
  defaultValue?: string; // YYYY-MM-DD
};

const MONTHS = ['Január','Február','Marec','Apríl','Máj','Jún','Júl','August','September','Október','November','December'];
const DOW = ['Po','Ut','St','Št','Pi','So','Ne'];

function pad(n: number) { return String(n).padStart(2, '0'); }

function toDisplay(iso: string) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return '';
  return `${parseInt(d)}.${parseInt(m)}.${y}`;
}

function toISO(display: string): string {
  const match = display.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!match) return '';
  const [, d, m, y] = match;
  return `${y}-${pad(parseInt(m))}-${pad(parseInt(d))}`;
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function firstDowOfMonth(year: number, month: number) {
  // 0=Mon … 6=Sun
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

export default function DatePicker({ name, defaultValue = '' }: Props) {
  const [iso, setIso] = useState(defaultValue);
  const [display, setDisplay] = useState(toDisplay(defaultValue));
  const [open, setOpen] = useState(false);
  const [inputError, setInputError] = useState(false);

  const today = new Date();
  const initYear = iso ? parseInt(iso.split('-')[0]) : today.getFullYear();
  const initMonth = iso ? parseInt(iso.split('-')[1]) - 1 : today.getMonth();
  const [viewYear, setViewYear] = useState(initYear);
  const [viewMonth, setViewMonth] = useState(initMonth);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function selectDay(day: number) {
    const newIso = `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`;
    setIso(newIso);
    setDisplay(toDisplay(newIso));
    setInputError(false);
    setOpen(false);
  }

  function handleDisplayChange(val: string) {
    setDisplay(val);
    const parsed = toISO(val);
    if (parsed) {
      setIso(parsed);
      setInputError(false);
      const [y, m] = parsed.split('-');
      setViewYear(parseInt(y));
      setViewMonth(parseInt(m) - 1);
    } else {
      setIso('');
      setInputError(val.length > 0);
    }
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  const totalDays = daysInMonth(viewYear, viewMonth);
  const startDow = firstDowOfMonth(viewYear, viewMonth);
  const selectedDay = iso && iso.startsWith(`${viewYear}-${pad(viewMonth + 1)}`)
    ? parseInt(iso.split('-')[2])
    : null;
  const todayDay = today.getFullYear() === viewYear && today.getMonth() === viewMonth
    ? today.getDate()
    : null;

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name={name} value={iso} />

      <div className={[
        'flex items-center gap-2 rounded-2xl border bg-slate-950 px-4 py-3 transition-colors',
        open ? 'border-emerald-500' : inputError ? 'border-red-500/60' : 'border-slate-700',
      ].join(' ')}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-slate-500">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <input
          type="text"
          value={display}
          onChange={(e) => handleDisplayChange(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="d.m.rrrr"
          className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none"
        />
        {display && (
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); setDisplay(''); setIso(''); setInputError(false); }}
            className="text-slate-600 hover:text-slate-400"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        )}
      </div>

      {inputError && (
        <p className="mt-1 text-xs text-red-400">Formát: d.m.rrrr (napr. 5.4.2025)</p>
      )}

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/60">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
            <button type="button" onMouseDown={(e) => { e.preventDefault(); prevMonth(); }}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span className="text-sm font-semibold text-white">{MONTHS[viewMonth]} {viewYear}</span>
            <button type="button" onMouseDown={(e) => { e.preventDefault(); nextMonth(); }}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>

          {/* Day-of-week labels */}
          <div className="grid grid-cols-7 border-b border-slate-800 px-2 py-2">
            {DOW.map(d => (
              <div key={d} className="text-center text-xs font-medium text-slate-500">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-y-1 px-2 py-2">
            {Array.from({ length: startDow }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: totalDays }).map((_, i) => {
              const day = i + 1;
              const isSelected = selectedDay === day;
              const isToday = todayDay === day;
              return (
                <button
                  key={day}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); selectDay(day); }}
                  className={[
                    'mx-auto flex h-8 w-8 items-center justify-center rounded-xl text-sm transition-colors',
                    isSelected
                      ? 'bg-emerald-500 font-semibold text-slate-950'
                      : isToday
                      ? 'border border-emerald-500/50 text-emerald-400 hover:bg-slate-800'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                  ].join(' ')}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Today shortcut */}
          <div className="border-t border-slate-800 px-3 py-2">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                const t = new Date();
                const newIso = `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;
                setIso(newIso);
                setDisplay(toDisplay(newIso));
                setViewYear(t.getFullYear());
                setViewMonth(t.getMonth());
                setOpen(false);
              }}
              className="w-full rounded-xl py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              Dnes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
