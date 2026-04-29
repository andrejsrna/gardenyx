'use client';

import { useCallback, useRef, useState } from 'react';
import Image from 'next/image';

type Props = {
  folder: 'products' | 'articles';
  hiddenFieldName: string;
  defaultSrc?: string;
  altFieldName?: string;
  defaultAlt?: string;
};

export default function ImageUploadZone({
  folder,
  hiddenFieldName,
  defaultSrc = '',
  altFieldName,
  defaultAlt = '',
}: Props) {
  const [src, setSrc] = useState(defaultSrc);
  const [alt, setAlt] = useState(defaultAlt);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const upload = useCallback(async (file: File) => {
    setError('');
    setUploading(true);
    setProgress(10);

    const timer = setInterval(() => {
      setProgress((p) => (p < 85 ? p + Math.random() * 15 : p));
    }, 300);

    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', folder);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Upload zlyhal');
      }
      const data = await res.json();
      setProgress(100);
      setSrc(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Neznáma chyba');
    } finally {
      clearInterval(timer);
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 400);
    }
  }, [folder]);

  const handleFiles = useCallback((files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    upload(file);
  }, [upload]);

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    setDragging(true);
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) setDragging(false);
  };
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      <input type="hidden" name={hiddenFieldName} value={src} />

      {src ? (
        <div className="group relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-950">
          <div className="relative aspect-video w-full">
            <Image
              src={src}
              alt={alt || 'preview'}
              fill
              className="object-contain p-3"
              unoptimized
            />
          </div>

          {uploading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/80 backdrop-blur-sm">
              <div className="h-1 w-48 overflow-hidden rounded-full bg-slate-700">
                <div
                  className="h-full rounded-full bg-emerald-400 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-slate-400">Nahrávam…</p>
            </div>
          )}

          {!uploading && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-950/0 opacity-0 transition-all duration-200 group-hover:bg-slate-950/60 group-hover:opacity-100">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="rounded-xl border border-slate-600 bg-slate-800 px-4 py-2 text-xs font-semibold text-white transition hover:border-emerald-500 hover:bg-slate-700"
              >
                Zameniť
              </button>
              <button
                type="button"
                onClick={() => setSrc('')}
                className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-red-500 hover:text-red-400"
              >
                Odstrániť
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => !uploading && inputRef.current?.click()}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
          disabled={uploading}
          className={[
            'relative flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all duration-200',
            dragging
              ? 'border-emerald-400 bg-emerald-500/10 scale-[1.01]'
              : 'border-slate-700 bg-slate-950 hover:border-emerald-600 hover:bg-slate-900',
            uploading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
          ].join(' ')}
        >
          {uploading ? (
            <>
              <div className="h-1 w-40 overflow-hidden rounded-full bg-slate-700">
                <div
                  className="h-full rounded-full bg-emerald-400 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-slate-400">Nahrávam…</p>
            </>
          ) : (
            <>
              <div className={[
                'flex h-14 w-14 items-center justify-center rounded-2xl border transition-colors duration-200',
                dragging ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300' : 'border-slate-700 bg-slate-900 text-slate-400',
              ].join(' ')}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <div>
                <p className={['text-sm font-medium transition-colors', dragging ? 'text-emerald-300' : 'text-slate-200'].join(' ')}>
                  {dragging ? 'Pustiť na nahratie' : 'Pretiahnite obrázok sem'}
                </p>
                <p className="mt-1 text-xs text-slate-500">alebo kliknite a vyberte súbor · JPG, PNG, WebP · max 20 MB</p>
              </div>
            </>
          )}
        </button>
      )}

      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs text-red-400">
          {error}
        </p>
      )}

      {altFieldName && (
        <label className="block space-y-1">
          <span className="text-xs font-medium text-slate-400">Alt text (pre SEO a prístupnosť)</span>
          <input
            name={altFieldName}
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="Popis obrázka"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
          />
        </label>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
