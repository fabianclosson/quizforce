'use client';

import { useEffect } from 'react';

/**
 * Hook to ensure CSRF token is available
 * This should be used in the root layout or main components
 */
export function useCSRFToken() {
  useEffect(() => {
    // Check if CSRF token exists in cookies
    const hasCSRFToken = document.cookie.includes('__csrf-token=');
    
    if (!hasCSRFToken) {
      // Make a request to get CSRF token
      fetch('/api/csrf-token', {
        method: 'GET',
        credentials: 'same-origin',
      }).catch((error) => {
        console.warn('Failed to fetch CSRF token:', error);
      });
    }
  }, []);
}
