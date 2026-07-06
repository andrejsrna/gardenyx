import {
  TransactionalEmailsApi,
  SendSmtpEmail,
  TransactionalEmailsApiApiKeys,
} from '@getbrevo/brevo';
import { getSiteUrl } from '../automation/config';
import { renderEmail } from './template';

// ---------------------------------------------------------------------------
// i18n strings
// ---------------------------------------------------------------------------

type Locale = 'sk' | 'en' | 'hu';

const STRINGS: Record<
  Locale,
  {
    subject: string;
    preheader: string;
    greeting: (name?: string | null) => string;
    intro: string;
    readMore: string;
    unsubscribe: string;
    footerTeam: string;
    title: string;
  }
> = {
  sk: {
    subject: 'Aktuality z GardenYX blogu 🌿',
    preheader: 'Nové články z nášho záhradkárskeho blogu – čítajte, kedy vám to vyhovuje.',
    greeting: (n) => (n ? `Ahoj ${n},` : 'Ahoj,'),
    intro:
      'Prinášame vám najnovšie tipy, návody a sezónne odporúčania priamo z nášho blogu. Vyberte si, čo vás zaujíma:',
    readMore: 'Čítať ďalej →',
    unsubscribe: 'Odhlásiť sa z newslettera',
    footerTeam: 'Tím GardenYX',
    title: 'Čerstvé aktuality zo záhrady 🌱',
  },
  en: {
    subject: 'GardenYX Blog Digest 🌿',
    preheader: 'Fresh gardening articles – read them when it suits you.',
    greeting: (n) => (n ? `Hi ${n},` : 'Hi,'),
    intro:
      'Here are the latest tips, guides and seasonal advice straight from our blog. Pick what interests you:',
    readMore: 'Read more →',
    unsubscribe: 'Unsubscribe from newsletter',
    footerTeam: 'The GardenYX team',
    title: 'Fresh garden updates 🌱',
  },
  hu: {
    subject: 'GardenYX blog összefoglaló 🌿',
    preheader: 'Friss kertészeti cikkek – olvassa, amikor ideje van.',
    greeting: (n) => (n ? `Szia ${n},` : 'Szia,'),
    intro:
      'Íme a legújabb tippek, útmutatók és szezonális tanácsok közvetlenül blogunkból. Válassza ki, ami érdekli:',
    readMore: 'Tovább olvasom →',
    unsubscribe: 'Leiratkozás a hírlevélről',
    footerTeam: 'A GardenYX csapata',
    title: 'Friss kerti hírek 🌱',
  },
};

// ---------------------------------------------------------------------------
// Article card builder
// ---------------------------------------------------------------------------

type ArticleCard = {
  title: string;
  excerpt: string;
  url: string;
  coverImage?: string | null;
  readMoreLabel: string;
};

const buildArticleCard = (card: ArticleCard) => {
  const imgHtml = card.coverImage
    ? `<img src="${card.coverImage}" alt="${card.title}" width="660" style="display:block;width:100%;max-width:660px;height:auto;border-radius:12px 12px 0 0;margin:0 0 16px 0;" />`
    : '';

  return `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
    style="margin:0 0 20px 0;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;background:#ffffff;">
    <tr>
      <td style="padding:0;">
        ${imgHtml}
        <div style="padding:16px 18px 18px 18px;">
          <h2 style="margin:0 0 8px 0;font-size:18px;line-height:26px;font-weight:800;color:#2b3026;">${card.title}</h2>
          <p style="margin:0 0 14px 0;color:#475569;font-size:14px;line-height:22px;">${card.excerpt}</p>
          <a href="${card.url}"
            style="display:inline-block;padding:10px 18px;background:#515a45;color:#ffffff;border-radius:10px;font-size:13px;font-weight:700;text-decoration:none;letter-spacing:0.01em;">
            ${card.readMoreLabel}
          </a>
        </div>
      </td>
    </tr>
  </table>
`.trim();
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DigestArticle = {
  /** localized slug used to build the URL */
  slug: string;
  title: string;
  excerpt: string;
  coverImage?: string | null;
};

export type SendNewsletterDigestParams = {
  to: string;
  firstName?: string | null;
  locale?: string | null;
  articles: DigestArticle[];
};

// ---------------------------------------------------------------------------
// normalizeLocale helper
// ---------------------------------------------------------------------------

function normalizeLocale(raw?: string | null): Locale {
  const l = (raw || 'sk').toLowerCase().trim().slice(0, 2);
  if (l === 'en') return 'en';
  if (l === 'hu') return 'hu';
  return 'sk';
}

// ---------------------------------------------------------------------------
// URL builder – maps locale to localized path prefix
// ---------------------------------------------------------------------------

const LOCALE_PREFIX: Record<Locale, string> = {
  sk: 'sk',
  en: 'en',
  hu: 'hu',
};

function articleUrl(siteUrl: string, locale: Locale, slug: string): string {
  return `${siteUrl}/${LOCALE_PREFIX[locale]}/blog/${slug}`;
}

// ---------------------------------------------------------------------------
// Main send function
// ---------------------------------------------------------------------------

export async function sendNewsletterDigest(params: SendNewsletterDigestParams): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY?.trim().replace(/^['\"]|['\"]$/g, '');
  if (!apiKey) throw new Error('BREVO_API_KEY is missing');

  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'newsletter@gardenyx.eu';
  const senderName = process.env.BREVO_SENDER_NAME || 'GardenYX';
  const siteUrl = getSiteUrl();
  const unsubscribeBase = `${siteUrl}/api/newsletter/unsubscribe`;

  const locale = normalizeLocale(params.locale);
  const s = STRINGS[locale];

  const cardsHtml = params.articles
    .map((article) =>
      buildArticleCard({
        title: article.title,
        excerpt: article.excerpt,
        url: articleUrl(siteUrl, locale, article.slug),
        coverImage: article.coverImage,
        readMoreLabel: s.readMore,
      })
    )
    .join('\n');

  const unsubscribeUrl = `${unsubscribeBase}?email=${encodeURIComponent(params.to)}`;

  const content = `
    <p style="margin:0 0 18px 0;color:#475569;">${s.intro}</p>
    ${cardsHtml}
    <p style="margin:24px 0 4px 0;font-weight:700;color:#2b3026;">${s.footerTeam}</p>
    <p style="margin:0;color:#94a3b8;font-size:12px;line-height:18px;">
      <a href="${unsubscribeUrl}" style="color:#94a3b8;">${s.unsubscribe}</a>
    </p>
  `;

  const textContent = [
    s.greeting(params.firstName),
    '',
    s.intro,
    '',
    ...params.articles.map(
      (a) =>
        `${a.title}\n${a.excerpt}\n${articleUrl(siteUrl, locale, a.slug)}`
    ),
    '',
    s.footerTeam,
    `${s.unsubscribe}: ${unsubscribeUrl}`,
  ].join('\n');

  const htmlContent = renderEmail({
    title: s.title,
    preheader: s.preheader,
    greeting: s.greeting(params.firstName),
    content,
    headerVariant: 'image',
    footerNote: `<a href="${unsubscribeUrl}" style="color:#94a3b8;">${s.unsubscribe}</a>`,
  });

  const api = new TransactionalEmailsApi();
  api.setApiKey(TransactionalEmailsApiApiKeys.apiKey, apiKey);

  const email = new SendSmtpEmail();
  email.subject = s.subject;
  email.htmlContent = htmlContent;
  email.textContent = textContent;
  email.sender = { name: senderName, email: senderEmail };
  email.to = [{ email: params.to, name: params.firstName || undefined }];

  await api.sendTransacEmail(email);
}
