/**
 * Client-side CSRF token utilities
 * Used by frontend components to include CSRF tokens in API requests
 */

/**
 * Get CSRF token from cookies (client-side)
 */
export function getCSRFTokenFromCookies(): string | null {
  if (typeof document === 'undefined') {
    return null; // Server-side, no access to document
  }

  // Parse cookies to find the CSRF token
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key && value) {
      acc[key] = decodeURIComponent(value);
    }
    return acc;
  }, {} as Record<string, string>);

  return cookies['__csrf-token'] || null;
}

/**
 * Create headers with CSRF token for API requests
 */
export function createCSRFHeaders(): Record<string, string> {
  const token = getCSRFTokenFromCookies();
  
  if (!token) {
    console.warn('No CSRF token found in cookies');
    return {};
  }

  return {
    'X-CSRF-Token': token,
  };
}

/**
 * Create fetch options with CSRF token
 */
export function createSecureFetchOptions(options: RequestInit = {}): RequestInit {
  const csrfHeaders = createCSRFHeaders();
  
  return {
    ...options,
    headers: {
      ...csrfHeaders,
      ...options.headers,
    },
  };
} 