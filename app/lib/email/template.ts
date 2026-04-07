type EmailCta = {
  label: string;
  url: string;
};

type RenderEmailParams = {
  title: string;
  preheader?: string;
  greeting?: string;
  content: string;
  cta?: EmailCta;
  footerNote?: string;
  highlight?: string;
};

const BRAND = {
  primary: '#10b981',
  primaryDark: '#0f766e',
  surface: '#ffffff',
  paper: '#f5f7fb',
  text: '#0f172a',
  muted: '#475569',
  border: '#e2e8f0'
};

const SITE_URL = getSiteUrl();
const LOGO_URL = `${SITE_URL}/logo.png`;
const TAGLINE = 'Starostlivosť o vašu záhradu';

export const emailButton = (cta: EmailCta) => `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 18px 0;">
    <tr>
      <td style="border-radius:14px;overflow:hidden;background:linear-gradient(135deg,${BRAND.primary} 0%,#0ea5e9 100%);">
        <a href="${cta.url}" style="display:inline-block;padding:14px 20px;font-family:'Inter','Arial',sans-serif;font-size:14px;font-weight:800;color:#ffffff;text-decoration:none;letter-spacing:0.01em;">${cta.label}</a>
      </td>
    </tr>
  </table>
`;

export const infoNote = (text: string) => `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 14px 0;">
    <tr>
      <td style="padding:14px;border:1px solid ${BRAND.border};border-radius:12px;background:#f8fafc;color:${BRAND.muted};font-size:14px;line-height:22px;">${text}</td>
    </tr>
  </table>
`;

export const keyValueTable = (rows: Array<{ label: string; value: string }>) => `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 14px 0;">
    <tbody>
      ${rows.map(row => `
        <tr>
          <td style="padding:10px;border:1px solid ${BRAND.border};background:#f8fafc;font-weight:600;color:${BRAND.text};">${row.label}</td>
          <td style="padding:10px;border:1px solid ${BRAND.border};color:${BRAND.muted};">${row.value}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
`;

export function renderEmail(params: RenderEmailParams) {
  const preheader = params.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;font-size:1px;color:transparent;line-height:1px;">${params.preheader}</div>`
    : '';

  const greeting = params.greeting
    ? `<p style="margin:0 0 12px 0;color:${BRAND.text};">${params.greeting}</p>`
    : '';

  const highlight = params.highlight
    ? `<div style="margin:0 0 14px 0;padding:12px 14px;border-radius:12px;background:#ecfdf3;color:#064e3b;font-weight:700;">${params.highlight}</div>`
    : '';

  const button = params.cta ? emailButton(params.cta) : '';
  const footer = params.footerNote
    ? `<p style="margin:14px 0 0 0;color:#94a3b8;font-size:12px;line-height:18px;">${params.footerNote}</p>`
    : `<p style="margin:14px 0 0 0;color:#94a3b8;font-size:12px;line-height:18px;">Ak ste tento email neočakávali, môžete ho ignorovať.</p>`;

  return `
    ${preheader}
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:${BRAND.paper};padding:0;margin:0;">
      <tr>
        <td align="center" style="padding:28px 14px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:720px;background:${BRAND.surface};border-radius:24px;overflow:hidden;border:1px solid ${BRAND.border};box-shadow:0 18px 60px rgba(15,118,110,0.18);">
            <tr>
              <td style="padding:0;background:linear-gradient(135deg,${BRAND.primary} 0%,${BRAND.primaryDark} 100%);color:#ecfdf3;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="padding:18px 22px;font-family:'Inter','Arial',sans-serif;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;font-weight:700;">
                      <a href="${SITE_URL}" style="text-decoration:none;display:inline-flex;align-items:center;gap:10px;color:#ecfdf3;">
                        <img src="${LOGO_URL}" alt="GardenYX" width="150" height="44" style="display:block;max-width:150px;height:auto;" />
                      </a>
                    </td>
                    <td align="right" style="padding:18px 22px;font-family:'Inter','Arial',sans-serif;font-size:12px;font-weight:600;">${TAGLINE}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 24px 22px 24px;font-family:'Inter','Arial',sans-serif;color:${BRAND.text};font-size:15px;line-height:24px;background:linear-gradient(180deg,#f8fafc 0%,#ffffff 18%);">
                ${greeting}
                <h1 style="margin:0 0 12px 0;font-size:26px;line-height:32px;font-weight:800;color:#052e16;">${params.title}</h1>
                ${highlight}
                <div style="margin:0 0 14px 0;color:${BRAND.muted};">${params.content}</div>
                ${button}
                ${footer}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}
import { getSiteUrl } from '../automation/config';
