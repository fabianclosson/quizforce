'use client';

import { useEffect, useState } from 'react';
import { getStripe } from '@/lib/stripe';
import { config } from '@/lib/config';

export default function DebugStripePage() {
  const [stripeInstance, setStripeInstance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkStripe = async () => {
      try {
        console.log('=== CLIENT-SIDE STRIPE DEBUG ===');
        console.log('Environment variables available to client:', {
          NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
          hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
          publishableKeyLength: (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '').length,
        });
        
        console.log('Config object on client:', {
          stripeIsConfigured: config.stripe.isConfigured,
          publishableKey: config.stripe.publishableKey,
          publishableKeyLength: config.stripe.publishableKey.length,
        });
        
        const stripe = await getStripe();
        console.log('getStripe() result:', stripe);
        setStripeInstance(stripe);
        setLoading(false);
      } catch (err: any) {
        console.error('Error checking Stripe:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    checkStripe();
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Stripe Configuration Debug</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Environment Variables (Client-Side)</h2>
          <pre className="text-sm">
            {JSON.stringify({
              NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'NOT_SET',
              hasKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
              keyLength: (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '').length,
            }, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Config Object</h2>
          <pre className="text-sm">
            {JSON.stringify({
              isConfigured: config.stripe.isConfigured,
              publishableKey: config.stripe.publishableKey || 'NOT_SET',
              publishableKeyLength: config.stripe.publishableKey.length,
            }, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Stripe Instance</h2>
          {loading && <p>Loading Stripe...</p>}
          {error && <p className="text-red-600">Error: {error}</p>}
          {!loading && !error && (
            <pre className="text-sm">
              {JSON.stringify({
                stripeLoaded: !!stripeInstance,
                stripeType: typeof stripeInstance,
                hasStripeInstance: stripeInstance !== null,
              }, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
} 