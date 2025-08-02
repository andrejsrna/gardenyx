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
      console.error('Facebook Conversion API error:', response.status, errorText);
      try {
        const errorJson = JSON.parse(errorText);
        console.error('Parsed error:', errorJson);
      } catch {
        // Not a JSON response
      }
      return false;
    }

    const result = await response.json();
    console.log('Facebook Conversion API success:', result);
    return true;
  } catch (error) {
    console.error('Error sending Facebook Conversion API event:', error);
    return false;
  }
}

export function hashUserData(data: Record<string, unknown>): Record<string, unknown> {
  const hashedData: Record<string, unknown> = {};
  
  if (data.email) {
    hashedData.em = data.email; // Facebook expects hashed email
  }
  
  if (data.phone) {
    hashedData.ph = data.phone; // Facebook expects hashed phone
  }
  
  if (data.firstName) {
    hashedData.fn = data.firstName; // Facebook expects hashed first name
  }
  
  if (data.lastName) {
    hashedData.ln = data.lastName; // Facebook expects hashed last name
  }
  
  if (data.city) {
    hashedData.ct = data.city; // Facebook expects hashed city
  }
  
  if (data.state) {
    hashedData.st = data.state; // Facebook expects hashed state
  }
  
  if (data.zip) {
    hashedData.zp = data.zip; // Facebook expects hashed zip
  }
  
  if (data.country) {
    hashedData.country = data.country; // Facebook expects hashed country
  }
  
  return hashedData;
}
