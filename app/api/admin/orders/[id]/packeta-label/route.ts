import { NextRequest, NextResponse } from 'next/server';
import { Builder, Parser } from 'xml2js';
import prisma from '@/app/lib/prisma';

const PACKETA_API_URL = 'https://www.zasilkovna.cz/api/rest';

type PacketaLabelResponse = {
  response?: {
    status?: string;
    string?: string;
    fault?: { faultString?: string };
    result?: string;
  };
};

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const apiPassword = process.env.PACKETA_API_SECRET;
  if (!apiPassword) {
    return NextResponse.json({ error: 'Missing PACKETA_API_SECRET' }, { status: 500 });
  }

  const order = await prisma.order.findUnique({
    where: { id },
    select: { meta: true, orderNumber: true },
  });
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  const packetId = order.meta.find(m => m.key === '_packeta_packet_id')?.value;
  if (!packetId) return NextResponse.json({ error: 'No Packeta packet for this order' }, { status: 404 });

  const builder = new Builder({
    renderOpts: { pretty: false },
    xmldec: { version: '1.0', encoding: 'UTF-8' },
  });
  const xmlBody = builder.buildObject({
    packetLabelPdf: {
      apiPassword,
      packetId,
      format: 'A6 on A4',
      offset: 0,
    },
  });

  const res = await fetch(PACKETA_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/xml', Accept: 'application/xml' },
    body: xmlBody,
  });

  const contentType = res.headers.get('content-type') || '';

  // Packeta may return PDF directly or as XML-wrapped base64
  if (contentType.includes('pdf')) {
    const pdf = await res.arrayBuffer();
    const filename = `packeta-${order.orderNumber ?? id}.pdf`;
    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  }

  // Parse XML response
  const text = await res.text();
  const parser = new Parser({ explicitArray: false });
  let parsed: PacketaLabelResponse;
  try {
    parsed = await parser.parseStringPromise(text) as PacketaLabelResponse;
  } catch {
    return NextResponse.json({ error: 'Invalid Packeta response', raw: text }, { status: 502 });
  }

  if (parsed?.response?.status !== 'ok') {
    const msg = parsed?.response?.fault?.faultString || parsed?.response?.string || 'Packeta error';
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  // Base64-encoded PDF in result
  const b64 = parsed?.response?.result;
  if (!b64) return NextResponse.json({ error: 'Empty label response' }, { status: 502 });

  const pdfBuffer = Buffer.from(b64, 'base64');
  const filename = `packeta-${order.orderNumber ?? id}.pdf`;
  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
