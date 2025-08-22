import type { ReactNode } from 'react';
import { GoogleAnalytics } from './google';
import { keys } from './keys';
import { PostHogProvider } from './posthog/client';
import { VercelAnalytics } from './vercel';

type AnalyticsProviderProps = {
  children: ReactNode;
};

const { NEXT_PUBLIC_GA_MEASUREMENT_ID } = keys();

export const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => (
  <PostHogProvider>
    {children}
    <VercelAnalytics />
    {NEXT_PUBLIC_GA_MEASUREMENT_ID && (
      <GoogleAnalytics gaId={NEXT_PUBLIC_GA_MEASUREMENT_ID} />
    )}
  </PostHogProvider>
);

// Re-export analytics utilities
export * from './events';
export * from './hooks';
export { posthog } from 'posthog-js';
