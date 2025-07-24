/**
 * React Hook for CSRF Token Management
 *
 * This hook provides CSRF tokens for client-side forms and API requests.
 * It automatically fetches and caches tokens, and provides utilities for
 * including tokens in requests.
 */

import { useQuery } from "@tanstack/react-query";

interface CSRFTokenResponse {
  csrfToken: string;
  success: boolean;
}

/**
 * Hook to get and manage CSRF tokens
 *
 * @returns Object with CSRF token, loading state, and utility functions
 */
export function useCSRF() {
  const { data, isLoading, error, refetch } = useQuery<CSRFTokenResponse>({
    queryKey: ["csrf-token"],
    queryFn: async () => {
      const response = await fetch("/api/csrf-token");

      if (!response.ok) {
        throw new Error("Failed to fetch CSRF token");
      }

      return response.json();
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  /**
   * Get headers with CSRF token for fetch requests
   *
   * @param additionalHeaders - Additional headers to include
   * @returns Headers object with CSRF token
   */
  const getCSRFHeaders = (additionalHeaders: Record<string, string> = {}) => {
    const headers: Record<string, string> = {
      ...additionalHeaders,
    };

    if (data?.csrfToken) {
      headers["x-csrf-token"] = data.csrfToken;
    }

    return headers;
  };

  /**
   * Create a FormData object with CSRF token
   *
   * @param formData - Existing FormData or plain object
   * @returns FormData with CSRF token included
   */
  const addCSRFToFormData = (
    formData: FormData | Record<string, unknown>
  ): FormData => {
    const form = formData instanceof FormData ? formData : new FormData();

    if (!(formData instanceof FormData)) {
      // Convert object to FormData
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          form.append(key, String(value));
        }
      });
    }

    if (data?.csrfToken) {
      form.append("csrf_token", data.csrfToken);
    }

    return form;
  };

  /**
   * Enhanced fetch function with automatic CSRF token inclusion
   *
   * @param url - Request URL
   * @param options - Fetch options
   * @returns Promise resolving to Response
   */
  const fetchWithCSRF = async (url: string, options: RequestInit = {}) => {
    const { headers = {}, ...otherOptions } = options;

    return fetch(url, {
      ...otherOptions,
      headers: getCSRFHeaders(headers as Record<string, string>),
    });
  };

  return {
    csrfToken: data?.csrfToken,
    isLoading,
    error,
    refetch,
    getCSRFHeaders,
    addCSRFToFormData,
    fetchWithCSRF,
    isReady: !!data?.csrfToken && !isLoading,
  };
}
