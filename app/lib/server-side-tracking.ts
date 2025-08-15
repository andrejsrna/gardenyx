import { sendFacebookConversionEvent, hashUserData } from './facebook-conversion';
import { getCookie } from 'cookies-next';

const PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

export async function trackServerSideEvent(
  eventName: string,
  params?: Record<string, unknown>,
  userData: Record<string, unknown> = {}
) {
  if (!PIXEL_ID) {
    console.warn('Facebook Pixel ID not configured');
    return;
  }

  try {
    // Prepare user data for Conversion API
    const fbp = getCookie('_fbp')?.toString();
    const fbc = getCookie('_fbc')?.toString();
    
    if (fbp) {
      userData.fbp = fbp;
    }

    if (fbc) {
      userData.fbc = fbc;
    }
    
    // Add external_id for better event deduplication
    const timestamp = Date.now();
    const eventParams = {
      ...params,
      external_id: `${eventName}_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
      event_id: `${eventName}_${timestamp}`,
    };
    
    // Server-side conversion API only
    const hashedUserData = hashUserData(userData);
    await sendFacebookConversionEvent(eventName, eventParams, hashedUserData, PIXEL_ID);
    
  } catch (error) {
    console.error('Error sending server-side tracking event:', error);
  }
}