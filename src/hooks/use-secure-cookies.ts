/**
 * Secure Cookie Management Hook
 *
 * This hook provides utilities for managing cookies securely on the client side.
 * It includes validation, secure defaults, and proper error handling.
 */

import { useState, useEffect, useCallback } from "react";

/**
 * Cookie options for client-side cookie management
 */
interface CookieOptions {
  expires?: number | Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
}

/**
 * Default secure cookie options for client-side cookies
 */
const DEFAULT_CLIENT_COOKIE_OPTIONS: CookieOptions = {
  path: "/",
  secure:
    typeof window !== "undefined" && window.location.protocol === "https:",
  sameSite: "lax",
};

/**
 * Utility functions for cookie management
 */
class ClientCookieManager {
  /**
   * Set a cookie with secure defaults
   */
  static setCookie(
    name: string,
    value: string,
    options: CookieOptions = {}
  ): void {
    if (typeof document === "undefined") {
      console.warn("setCookie called on server side");
      return;
    }

    const opts = { ...DEFAULT_CLIENT_COOKIE_OPTIONS, ...options };
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    if (opts.expires) {
      const expires =
        opts.expires instanceof Date
          ? opts.expires
          : new Date(Date.now() + opts.expires * 1000);
      cookieString += `; expires=${expires.toUTCString()}`;
    }

    if (opts.path) {
      cookieString += `; path=${opts.path}`;
    }

    if (opts.domain) {
      cookieString += `; domain=${opts.domain}`;
    }

    if (opts.secure) {
      cookieString += "; secure";
    }

    if (opts.sameSite) {
      cookieString += `; samesite=${opts.sameSite}`;
    }

    document.cookie = cookieString;
  }

  /**
   * Get a cookie value
   */
  static getCookie(name: string): string | null {
    if (typeof document === "undefined") {
      return null;
    }

    const nameEQ = encodeURIComponent(name) + "=";
    const cookies = document.cookie.split(";");

    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }

    return null;
  }

  /**
   * Remove a cookie
   */
  static removeCookie(
    name: string,
    options: Partial<CookieOptions> = {}
  ): void {
    this.setCookie(name, "", {
      ...options,
      expires: new Date(0),
    });
  }

  /**
   * Check if cookies are enabled
   */
  static areCookiesEnabled(): boolean {
    if (typeof document === "undefined") {
      return false;
    }

    try {
      const testCookie = "__cookie_test__";
      this.setCookie(testCookie, "test");
      const enabled = this.getCookie(testCookie) === "test";
      this.removeCookie(testCookie);
      return enabled;
    } catch {
      return false;
    }
  }

  /**
   * Get all cookies as an object
   */
  static getAllCookies(): Record<string, string> {
    if (typeof document === "undefined") {
      return {};
    }

    const cookies: Record<string, string> = {};
    const cookieArray = document.cookie.split(";");

    for (let cookie of cookieArray) {
      cookie = cookie.trim();
      const [name, value] = cookie.split("=");
      if (name && value) {
        cookies[decodeURIComponent(name)] = decodeURIComponent(value);
      }
    }

    return cookies;
  }
}

/**
 * Hook for managing secure cookies
 */
export function useSecureCookies() {
  const [cookiesEnabled, setCookiesEnabled] = useState<boolean | null>(null);

  // Check if cookies are enabled on mount
  useEffect(() => {
    setCookiesEnabled(ClientCookieManager.areCookiesEnabled());
  }, []);

  /**
   * Set a cookie with secure defaults
   */
  const setCookie = useCallback(
    (name: string, value: string, options: CookieOptions = {}): void => {
      try {
        ClientCookieManager.setCookie(name, value, options);
      } catch (error) {
        console.error("Failed to set cookie:", error);
      }
    },
    []
  );

  /**
   * Get a cookie value with state management
   */
  const getCookie = useCallback((name: string): string | null => {
    try {
      return ClientCookieManager.getCookie(name);
    } catch (error) {
      console.error("Failed to get cookie:", error);
      return null;
    }
  }, []);

  /**
   * Remove a cookie
   */
  const removeCookie = useCallback(
    (name: string, options: Partial<CookieOptions> = {}): void => {
      try {
        ClientCookieManager.removeCookie(name, options);
      } catch (error) {
        console.error("Failed to remove cookie:", error);
      }
    },
    []
  );

  /**
   * Get all cookies
   */
  const getAllCookies = useCallback((): Record<string, string> => {
    try {
      return ClientCookieManager.getAllCookies();
    } catch (error) {
      console.error("Failed to get all cookies:", error);
      return {};
    }
  }, []);

  return {
    cookiesEnabled,
    setCookie,
    getCookie,
    removeCookie,
    getAllCookies,
  };
}

/**
 * Hook for managing a specific cookie with state
 */
export function useCookie(
  name: string,
  defaultValue: string = "",
  options: CookieOptions = {}
): [string, (value: string) => void, () => void] {
  const { setCookie, getCookie, removeCookie } = useSecureCookies();
  const [value, setValue] = useState<string>(() => {
    return getCookie(name) ?? defaultValue;
  });

  // Update cookie and state
  const updateCookie = useCallback(
    (newValue: string) => {
      setCookie(name, newValue, options);
      setValue(newValue);
    },
    [name, setCookie, options]
  );

  // Remove cookie and reset state
  const deleteCookie = useCallback(() => {
    removeCookie(name, options);
    setValue(defaultValue);
  }, [name, removeCookie, options, defaultValue]);

  // Sync with actual cookie value on mount and when name changes
  useEffect(() => {
    const currentValue = getCookie(name);
    if (currentValue !== null && currentValue !== value) {
      setValue(currentValue);
    }
  }, [name, getCookie, value]);

  return [value, updateCookie, deleteCookie];
}

/**
 * Hook for managing user preferences with cookies
 */
export function usePreferenceCookie<T>(
  name: string,
  defaultValue: T,
  options: CookieOptions = {}
): [T, (value: T) => void, () => void] {
  const { setCookie, getCookie, removeCookie } = useSecureCookies();

  // Preference cookies should have longer expiration and be accessible to JS
  const preferenceOptions: CookieOptions = {
    expires: 60 * 60 * 24 * 365, // 1 year
    secure:
      typeof window !== "undefined" && window.location.protocol === "https:",
    sameSite: "lax",
    ...options,
  };

  const [value, setValue] = useState<T>(() => {
    try {
      const storedValue = getCookie(name);
      return storedValue ? JSON.parse(storedValue) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const updatePreference = useCallback(
    (newValue: T) => {
      try {
        setCookie(name, JSON.stringify(newValue), preferenceOptions);
        setValue(newValue);
      } catch (error) {
        console.error("Failed to update preference cookie:", error);
      }
    },
    [name, setCookie, preferenceOptions]
  );

  const deletePreference = useCallback(() => {
    removeCookie(name, preferenceOptions);
    setValue(defaultValue);
  }, [name, removeCookie, preferenceOptions, defaultValue]);

  return [value, updatePreference, deletePreference];
}

/**
 * Hook for cookie consent management
 */
export function useCookieConsent() {
  const [hasConsent, setHasConsent] = usePreferenceCookie(
    "cookie-consent",
    false
  );
  const [consentDetails, setConsentDetails] = usePreferenceCookie(
    "cookie-consent-details",
    {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: true,
    }
  );

  const giveConsent = useCallback(
    (details?: Partial<typeof consentDetails>) => {
      setHasConsent(true);
      if (details) {
        setConsentDetails({ ...consentDetails, ...details });
      }
    },
    [setHasConsent, setConsentDetails, consentDetails]
  );

  const revokeConsent = useCallback(() => {
    setHasConsent(false);
    setConsentDetails({
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    });
  }, [setHasConsent, setConsentDetails]);

  return {
    hasConsent,
    consentDetails,
    giveConsent,
    revokeConsent,
  };
}

/**
 * Export the utility class for direct use
 */
export { ClientCookieManager };
