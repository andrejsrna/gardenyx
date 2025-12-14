import { NextResponse } from 'next/server';
import { sendReactivationEmail } from '../../../../lib/newsletter/reactivation';

const TEST_EMAIL = 'ahoj@andrejsrna.sk';

export async function POST(request: Request) {
  const token = process.env.NEWSLETTER_ADMIN_TOKEN;
  if (!token || request.headers.get('x-admin-token') !== token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await sendReactivationEmail(TEST_EMAIL, 'Andrej', null);
    return NextResponse.json({ status: 'sent', to: TEST_EMAIL });
  } catch (error) {
    console.error('[reactivation-test] Failed to send', error);
    return NextResponse.json(
      {
        error: 'Failed to send test email',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 502 }
    );
  }
}
