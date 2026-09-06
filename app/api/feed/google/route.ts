import prisma from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.gardenyx.eu').replace(/\/$/, '');
const BRAND = 'GardenYX';

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function cdata(s: string): string {
  // CDATA cannot contain "]]>", split it
  return `<![CDATA[${s.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;
}

function mapAvailability(stockStatus?: string | null): string {
  if (!stockStatus) return 'in_stock';
  const v = stockStatus.toLowerCase();
  if (v === 'outofstock' || v === 'out_of_stock') return 'out_of_stock';
  if (v === 'onbackorder' || v === 'preorder') return 'preorder';
  return 'in_stock';
}

type StoredVariant = {
  id?: number;
  name?: string;
  sku?: string | null;
  price?: number;
  stockStatus?: string | null;
  weight?: number | null;
};

export async function GET() {
  const products = await prisma.product.findMany({
    where: { status: 'publish' },
    orderBy: { wcId: 'asc' },
  });

  const items: string[] = [];

  for (const p of products) {
    // normalize helpers
    const wcId = p.wcId.toString();
    const sku = p.sku?.trim() || wcId;
    const baseName = p.name?.trim() || 'Produkt';
    const baseDescRaw = (p.shortDescription || p.description || '').trim();
    const baseDesc = stripHtml(baseDescRaw).slice(0, 5000) || baseName;
    const stockStatus = p.stockStatus || 'instock';
    const availability = mapAvailability(stockStatus);
    const currency = p.currency || 'EUR';

    // images: Json -> array
    let images: { src: string }[] = [];
    try {
      const raw = p.images as unknown;
      if (Array.isArray(raw)) {
        images = (raw as Array<Record<string, unknown>>)
          .filter((x) => typeof x.src === 'string' && x.src)
          .map((x) => ({ src: String(x.src) }));
      }
    } catch {}

    const imageLink = images[0]?.src ? escapeXml(images[0].src) : '';
    const additionalImages = images.slice(1, 10).map((im) => `      <g:additional_image_link>${escapeXml(im.src)}</g:additional_image_link>`).join('\n');

    // variants
    let variants: StoredVariant[] = [];
    try {
      const raw = p.variants as unknown;
      if (Array.isArray(raw)) variants = raw as StoredVariant[];
    } catch {}

    const hasVariants = variants.length > 0 && variants.some((v) => v.name);

    // link base
    const linkBase = `${SITE_URL}/sk/produkt/${p.slug}`;

    if (hasVariants) {
      for (const v of variants) {
        const vid = v.id ? String(v.id) : sku;
        const vSku = v.sku?.trim() || `${sku}-${vid}`;
        const vPriceRaw = typeof v.price === 'number' && Number.isFinite(v.price) ? v.price : Number(p.price);
        const vPrice = Number.isFinite(vPriceRaw) ? vPriceRaw : 0;
        if (vPrice <= 0) continue;
        const vAvailability = mapAvailability(v.stockStatus || stockStatus);
        const vName = v.name ? `${baseName} - ${v.name}` : baseName;
        const vidId = `${wcId}-${vid}`;
        const vLink = `${linkBase}?variant=${vid}`;

        items.push(
          `    <item>\n` +
          `      <g:id>${escapeXml(vidId)}</g:id>\n` +
          `      <g:item_group_id>${escapeXml(wcId)}</g:item_group_id>\n` +
          `      <title>${cdata(vName)}</title>\n` +
          `      <description>${cdata(baseDesc)}</description>\n` +
          `      <g:link>${escapeXml(vLink)}</g:link>\n` +
          (imageLink ? `      <g:image_link>${imageLink}</g:image_link>\n` : '') +
          (additionalImages ? additionalImages + '\n' : '') +
          `      <g:availability>${vAvailability}</g:availability>\n` +
          `      <g:condition>new</g:condition>\n` +
          `      <g:price>${vPrice.toFixed(2)} ${currency}</g:price>\n` +
          `      <g:brand>${escapeXml(BRAND)}</g:brand>\n` +
          `      <g:mpn>${escapeXml(vSku)}</g:mpn>\n` +
          `      <g:identifier_exists>no</g:identifier_exists>\n` +
          `      <g:shipping>\n` +
          `        <g:country>SK</g:country>\n` +
          `        <g:service>Packeta</g:service>\n` +
          `        <g:price>3.50 EUR</g:price>\n` +
          `      </g:shipping>\n` +
          `      <g:google_product_category>Home &amp; Garden &gt; Lawn &amp; Garden &gt; Gardening &gt; Fertilizers</g:google_product_category>\n` +
          `    </item>`
        );
      }
    } else {
      const priceNum = Number(p.price);
      if (!Number.isFinite(priceNum) || priceNum <= 0) continue;
      items.push(
        `    <item>\n` +
        `      <g:id>${escapeXml(sku)}</g:id>\n` +
        `      <title>${cdata(baseName)}</title>\n` +
        `      <description>${cdata(baseDesc)}</description>\n` +
        `      <g:link>${escapeXml(linkBase)}</g:link>\n` +
        (imageLink ? `      <g:image_link>${imageLink}</g:image_link>\n` : '') +
        (additionalImages ? additionalImages + '\n' : '') +
        `      <g:availability>${availability}</g:availability>\n` +
        `      <g:condition>new</g:condition>\n` +
        `      <g:price>${priceNum.toFixed(2)} ${currency}</g:price>\n` +
        `      <g:brand>${escapeXml(BRAND)}</g:brand>\n` +
        `      <g:mpn>${escapeXml(sku)}</g:mpn>\n` +
        `      <g:identifier_exists>no</g:identifier_exists>\n` +
        `      <g:shipping>\n` +
        `        <g:country>SK</g:country>\n` +
        `        <g:service>Packeta</g:service>\n` +
        `        <g:price>3.50 EUR</g:price>\n` +
        `      </g:shipping>\n` +
        `      <g:google_product_category>Home &amp; Garden &gt; Lawn &amp; Garden &gt; Gardening &gt; Fertilizers</g:google_product_category>\n` +
        `    </item>`
      );
    }
  }

  const now = new Date().toUTCString();
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n` +
    `  <channel>\n` +
    `    <title>GardenYX - Product Feed</title>\n` +
    `    <link>${escapeXml(SITE_URL)}</link>\n` +
    `    <description>Google Merchant Center feed - GardenYX fertilizers and plant care</description>\n` +
    `    <lastBuildDate>${escapeXml(now)}</lastBuildDate>\n` +
    items.join('\n') + '\n' +
    `  </channel>\n` +
    `</rss>\n`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
    },
  });
}
