import { NextResponse } from 'next/server';
import { isAutomationAuthorized, isMarketingAutomationEnabled } from '../../../../lib/automation/config';
import { sendReactivationEmail } from '../../../../lib/newsletter/reactivation';

const TEST_EMAIL = 'ahoj@andrejsrna.sk';

export async function POST(request: Request) {
  if (!isAutomationAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isMarketingAutomationEnabled()) {
    return NextResponse.json({ status: 'disabled' });
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
