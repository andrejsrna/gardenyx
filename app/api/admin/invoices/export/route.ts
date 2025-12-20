import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { createInvoiceForOrder, type OrderWithRelations } from '@/app/lib/invoice/create-invoice';

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

  const rows: string[] = [];
  rows.push(['orderId', 'orderNumber', 'createdAt', 'invoiceNumber', 'invoiceUrl'].join(','));

  for (const order of orders) {
    let invoiceNumber = order.meta.find(m => m.key === '_invoice_number')?.value || '';
    let invoiceUrl = order.meta.find(m => m.key === '_invoice_url')?.value || '';

    if (!invoiceUrl) {
      const result = await createInvoiceForOrder(order, { force: true });
      if (result) {
        invoiceNumber = result.invoiceNumber;
        invoiceUrl = result.url;
      }
    }

    rows.push([
      order.id,
      order.orderNumber?.toString() || '',
      order.createdAt.toISOString(),
      invoiceNumber,
      invoiceUrl
    ].map(val => `"${(val || '').replace(/"/g, '""')}"`).join(','));
  }

  const csv = rows.join('\n');
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="invoices-${year}-${String(month).padStart(2, '0')}.csv"`
    }
  });
}
