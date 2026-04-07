const truthyValues = new Set(['1', 'true', 'yes', 'on']);

function isTruthy(value: string | undefined): boolean {
  return truthyValues.has((value || '').trim().toLowerCase());
}

export function getAutomationAdminToken(): string | null {
  return (
    process.env.GARDENYX_AUTOMATION_TOKEN ||
    process.env.AUTOMATION_ADMIN_TOKEN ||
    process.env.NEWSLETTER_ADMIN_TOKEN ||
    process.env.ADMIN_DASHBOARD_PASSWORD ||
    null
  );
}

export function isAutomationAuthorized(request: Request): boolean {
  const token = getAutomationAdminToken();
  if (!token) return false;

  const headerToken = request.headers.get('x-admin-token');
  return headerToken === token;
}

export function isMarketingAutomationEnabled(): boolean {
  return isTruthy(
    process.env.GARDENYX_ENABLE_MARKETING_AUTOMATIONS ||
      process.env.ENABLE_MARKETING_AUTOMATIONS ||
      process.env.ENABLE_NEWSLETTER_AUTOMATIONS ||
      'false',
  );
}

export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'https://gardenyx.eu').replace(/\/$/, '');
}
