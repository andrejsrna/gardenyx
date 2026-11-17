export function getCsrfToken(): string | undefined {
  const cookies = document.cookie.split(';');
  const csrfCookie = cookies.find(cookie => cookie.trim().startsWith('csrf-token='));
  return csrfCookie ? csrfCookie.split('=')[1] : undefined;
} 