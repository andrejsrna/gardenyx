'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';

export default function ImageUpload({ defaultSrc, defaultAlt }: { defaultSrc: string; defaultAlt: string }) {
  const [src, setSrc] = useState(defaultSrc);
  const [alt, setAlt] = useState(defaultAlt);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'products');
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setSrc(data.url);
    } catch (err) {
      alert('Upload sa nepodaril: ' + (err instanceof Error ? err.message : 'Neznáma chyba'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <input type="hidden" name="primaryImageSrc" value={src} />

      <div className="flex gap-3">
        <div className="flex-1 space-y-2">
          <label className="space-y-1 block">
            <span className="text-sm font-medium text-slate-200">URL obrázka</span>
            <input
              value={src}
              onChange={(e) => setSrc(e.target.value)}
              placeholder="/images/products/produkt.jpg"
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
            />
          </label>
          <label className="space-y-1 block">
            <span className="text-sm font-medium text-slate-200">Alt text</span>
            <input
              name="primaryImageAlt"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Popis obrázka"
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
            />
          </label>
        </div>

        {src && (
          <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">
            <Image src={src} alt={alt || 'preview'} fill className="object-contain p-2" unoptimized />
          </div>
        )}
      </div>

      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded-xl border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700 disabled:opacity-50"
        >
          {uploading ? 'Nahrávam…' : '⬆ Nahrať obrázok do R2'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleUpload(f);
          }}
        />
      </div>
    </div>
  );
}
