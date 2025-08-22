import type { ThemeProviderProps } from 'next-themes';

import { AuthProvider } from '@repo/auth/provider';
import { Toaster } from './components/ui/sonner';
import { TooltipProvider } from './components/ui/tooltip';
import { ThemeProvider } from './providers/theme';

type DesignSystemProviderProperties = ThemeProviderProps;

export const DesignSystemProvider = ({
  children,
  ...properties
}: DesignSystemProviderProperties) => {
  return (
    <ThemeProvider {...properties}>
      <AuthProvider
        publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      >
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
};

// Export all components
export * from './components';

// Export hooks that are needed by components
export { useStreamingText } from './hooks/use-streaming-text';
export type { UseStreamingTextOptions } from './hooks/use-streaming-text';

// Export utilities that might be needed
export { useIsIOSSafari, safariGPUAcceleration } from './lib/safari-utils';
export { cn } from './lib/utils';
export * from './lib/colors';
