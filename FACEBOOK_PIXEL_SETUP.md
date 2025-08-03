# Facebook Pixel & Conversion API Setup Guide

## Overview

Your Facebook Pixel implementation now includes both client-side pixel tracking and server-side Conversion API for better event deduplication and improved attribution.

## Environment Variables Required

Add these to your `.env.local` file:

```bash
# Facebook Pixel Configuration
NEXT_PUBLIC_FB_PIXEL_ID=your_pixel_id_here
FB_CONVERSION_API_ACCESS_TOKEN=your_access_token_here
```

## How to Get Your Facebook Pixel ID

1. Go to [Facebook Events Manager](https://business.facebook.com/events_manager2/list/pixel)
2. Select your pixel (or create a new one)
3. Copy the Pixel ID from the top of the page
4. The Pixel ID should look like: `123456789012345`

## How to Get Your Access Token

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Select your app
3. Go to "Tools" → "Graph API Explorer"
4. Select your app and request these permissions:
   - `ads_management`
   - `ads_read`
5. Generate an access token
6. Copy the access token

## Implementation Details

### Client-Side Pixel
- ✅ Facebook Pixel script loaded with proper initialization
- ✅ Cookie consent integration
- ✅ Page view tracking
- ✅ Event tracking functions

### Server-Side Conversion API
- ✅ User data hashing (SHA256) for privacy compliance
- ✅ Event deduplication with external_id
- ✅ IP address and user agent capture
- ✅ Error handling and logging

### Tracking Functions Available

```typescript
import { tracking } from '../lib/tracking';

// View product
await tracking.viewContent({
  id: 123,
  name: 'Product Name',
  price: 29.99,
  category: 'category'
});

// Add to cart
await tracking.addToCart({
  id: 123,
  name: 'Product Name',
  price: 29.99,
  quantity: 2,
  category: 'category'
});

// Purchase
await tracking.purchaseWithConversionAPI(
  'ORDER_123',
  [{
    id: 123,
    name: 'Product Name',
    price: 29.99,
    quantity: 2,
    category: 'category'
  }],
  59.98
);
```

## Testing

1. Visit `/test-fb` to test your implementation
2. Visit `/debug/facebook-pixel` to check your configuration
3. Check browser console for tracking logs
4. Verify events in Facebook Events Manager

## Privacy Compliance

- ✅ All user data is hashed with SHA256
- ✅ Cookie consent integration
- ✅ GDPR compliant data handling
- ✅ Server-side tracking for ad blockers

## Troubleshooting

### Common Issues

1. **"Invalid parameter" error**: Make sure all user data is hashed
2. **"Pixel ID doesn't exist"**: Verify your Pixel ID is correct
3. **"Access token invalid"**: Check your access token permissions
4. **Events not showing**: Check browser console for errors

### Debug Steps

1. Check environment variables are set correctly
2. Verify Pixel ID exists in Facebook Events Manager
3. Test with the debug endpoint: `/debug/facebook-pixel`
4. Check browser console for client-side errors
5. Check server logs for Conversion API errors

## Best Practices

1. **Always use both client-side and server-side tracking** for maximum coverage
2. **Hash all user data** except client_user_agent, click_id, and browser_id
3. **Use unique external_id** for event deduplication
4. **Test in development** with test_event_code
5. **Monitor Events Manager** for event quality scores

## Files Modified

- `app/components/FacebookPixel.tsx` - Client-side pixel implementation
- `app/layout.tsx` - Added Facebook Pixel component
- `app/lib/tracking.ts` - Updated tracking functions
- `app/api/facebook-conversion/route.ts` - Fixed user data hashing
- `app/test-fb/page.tsx` - Test page for verification 