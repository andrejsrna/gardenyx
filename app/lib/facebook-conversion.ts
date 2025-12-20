export async function sendFacebookConversionEvent(
  eventName: string,
  eventData: Record<string, unknown> = {},
  userData: Record<string, unknown> = {},
  pixelId: string,
): Promise<boolean> {
  try {
    const response = await fetch('/api/facebook-conversion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventName,
        eventData: {
          ...eventData,
          event_source_url: typeof window !== 'undefined' ? window.location.href : undefined,
        },
        userData,
        pixelId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        JSON.parse(errorText);
      } catch {
        // Not a JSON response
      }
      return false;
    }

    await response.json();
    return true;
  } catch {
    return false;
  }
}
