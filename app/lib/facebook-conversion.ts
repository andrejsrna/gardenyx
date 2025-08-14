import { createHash } from 'crypto';

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

function sha256Hash(value: string): string {
  return createHash('sha256').update(value.toLowerCase().trim()).digest('hex');
}

export function hashUserData(data: Record<string, unknown>): Record<string, unknown> {
  const hashedData: Record<string, unknown> = {};
  
  if (data.email && typeof data.email === 'string') {
    hashedData.em = sha256Hash(data.email);
  }
  
  if (data.phone && typeof data.phone === 'string') {
    // Remove all non-numeric characters and add country code if missing
    const cleanPhone = data.phone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('421') ? cleanPhone : `421${cleanPhone}`;
    hashedData.ph = sha256Hash(phoneWithCountry);
  }
  
  if (data.firstName && typeof data.firstName === 'string') {
    hashedData.fn = sha256Hash(data.firstName);
  }
  
  if (data.lastName && typeof data.lastName === 'string') {
    hashedData.ln = sha256Hash(data.lastName);
  }
  
  if (data.city && typeof data.city === 'string') {
    hashedData.ct = sha256Hash(data.city);
  }
  
  if (data.state && typeof data.state === 'string') {
    hashedData.st = sha256Hash(data.state);
  }
  
  if (data.zip && typeof data.zip === 'string') {
    hashedData.zp = sha256Hash(data.zip);
  }
  
  if (data.country && typeof data.country === 'string') {
    hashedData.country = sha256Hash(data.country);
  }
  
  // Pass through non-hashable parameters
  if (data.fbp) {
    hashedData.fbp = data.fbp;
  }
  
  if (data.fbc) {
    hashedData.fbc = data.fbc;
  }
  
  return hashedData;
}
