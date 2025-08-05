'use client';

import { useCSRFToken } from '@/hooks/use-csrf';

interface CSRFProviderProps {
  children: React.ReactNode;
}

/**
 * CSRF Provider component
 * Ensures CSRF tokens are available for the entire application
 */
export function CSRFProvider({ children }: CSRFProviderProps) {
  useCSRFToken();
  
  return <>{children}</>;
} 