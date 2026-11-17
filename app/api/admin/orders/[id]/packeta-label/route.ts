import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { fetchPacketaLabelPdf, labelPdfResponse } from '@eshop-core/packeta/label';

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const order = await prisma.order.findUnique({ where: { id }, select: { meta: true, orderNumber: true } });
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  const packetId = order.meta.find(m => m.key === '_packeta_packet_id')?.value;
  if (!packetId) {
    return NextResponse.json({ error: 'No Packeta packet for this order' }, { status: 404 });
  }

  try {
    return labelPdfResponse(await fetchPacketaLabelPdf(packetId), `packeta-${order.orderNumber ?? id}.pdf`);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Packeta error' }, { status: 502 });
  }
}
