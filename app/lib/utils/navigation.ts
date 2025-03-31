// Maximum allowed length for URL parameters
const MAX_URL_LENGTH = 2000;
const MAX_PARAM_LENGTH = 100;

/**
 * Safely updates browser history state by sanitizing URLs
 */
export function safeHistoryUpdate(url: string | URL, state?: Record<string, unknown>) {
  try {
    const urlObj = new URL(url, window.location.origin);

    // Validate URL length
    if (urlObj.toString().length > MAX_URL_LENGTH) {
      console.warn('URL exceeds maximum length, truncating parameters');
      urlObj.search = '';
    }

    // Validate and sanitize parameters
    const params = new URLSearchParams(urlObj.search);
    const sanitizedParams = new URLSearchParams();

    params.forEach((value, key) => {
      if (value.length <= MAX_PARAM_LENGTH) {
        sanitizedParams.append(key, value);
      }
    });

    urlObj.search = sanitizedParams.toString();

    // Safely update history
    try {
      window.history.replaceState(state, '', urlObj.toString());
    } catch (e) {
      console.warn('Failed to update history state:', e);
      // Fallback to pathname only if full URL fails
      window.history.replaceState(state, '', urlObj.pathname);
    }
  } catch (e) {
    console.error('Invalid URL:', e);
  }
}
