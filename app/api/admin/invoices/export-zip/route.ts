import { NextResponse } from 'next/server';
import archiver from 'archiver';
import prisma from '@/app/lib/prisma';
import { createInvoiceForOrder, type OrderWithRelations } from '@/app/lib/invoice/create-invoice';
import { Readable } from 'node:stream';

const parseIntSafe = (value: string | null) => {
  if (!value) return null;
  const num = Number(value);
  return Number.isInteger(num) ? num : null;
};

const resolveYearMonth = (yearParam: string | null, monthParam: string | null) => {
  const now = new Date();
  const year = parseIntSafe(yearParam) ?? now.getFullYear();
  const month = parseIntSafe(monthParam) ?? now.getMonth() + 1; // 1-12
  if (month < 1 || month > 12) return null;
  return { year, month };
};

const toHttps = (url?: string | null) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url.replace(/^\/+/, '')}`;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ym = resolveYearMonth(searchParams.get('year'), searchParams.get('month'));

  if (!ym) {
    return NextResponse.json({ error: 'Chýba alebo je neplatný mesiac/rok (očakávaný mesiac 1-12, rok 4 číslice)' }, { status: 400 });
  }

  const { year, month } = ym;
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(month === 12 ? year + 1 : year, month % 12, 1, 0, 0, 0, 0));

  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: start, lt: end }
    },
    include: { items: true, addresses: true, meta: true }
  }) as OrderWithRelations[];

  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.on('warning', err => console.warn('[invoice zip warning]', err));
  archive.on('error', err => {
    throw err;
  });

  const nodeStream = archive as unknown as NodeJS.ReadableStream;
  const webStream = Readable.toWeb(nodeStream) as unknown as ReadableStream;

  (async () => {
    for (const order of orders) {
      let invoiceNumber = order.meta.find(m => m.key === '_invoice_number')?.value || '';
      let invoiceUrl = toHttps(order.meta.find(m => m.key === '_invoice_url')?.value);

      if (!invoiceUrl) {
        const result = await createInvoiceForOrder(order, { force: true });
        if (result) {
          invoiceNumber = result.invoiceNumber;
          invoiceUrl = toHttps(result.url);
        }
      }

      if (!invoiceUrl) continue;

      try {
        const response = await fetch(invoiceUrl);
        if (!response.ok) {
          console.warn(`[invoice zip] fetch failed ${invoiceUrl} status ${response.status}`);
          continue;
        }
        const buffer = Buffer.from(await response.arrayBuffer());
        const fileName = `${invoiceNumber || order.id}.pdf`;
        archive.append(buffer, { name: fileName });
      } catch (error) {
        console.warn('[invoice zip] fetch error', error);
      }
    }
    await archive.finalize();
  })().catch(err => console.error('[invoice zip] worker error', err));

  return new NextResponse(webStream, {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="invoices-${year}-${String(month).padStart(2, '0')}.zip"`
    }
  });
}
