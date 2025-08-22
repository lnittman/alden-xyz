'use client';

import posthog from 'posthog-js';
import { PostHogProvider as Provider } from 'posthog-js/react';
import { type ReactNode, useEffect, useState } from 'react';
import { keys } from '../keys';

type PostHogProviderProps = {
  children: ReactNode;
};

const { NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_POSTHOG_HOST } = keys();
const enabled = Boolean(NEXT_PUBLIC_POSTHOG_KEY && NEXT_PUBLIC_POSTHOG_HOST);

// Generate a temporary anonymous ID
const generateAnonymousId = () => {
  return `anon_${Math.random().toString(36).substr(2, 9)}`;
};

export const PostHogProvider = ({ children }: PostHogProviderProps) => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized && typeof window !== 'undefined') {
      const isDev = process.env.NODE_ENV === 'development';

      if (!enabled) {
        setIsInitialized(true);
        return;
      }

      if (isDev) {
        // Provide mock implementation for development
        (window as any).posthog = {
          capture: (..._args: any[]) => {},
          identify: (..._args: any[]) => {},
        };
      }

      const initPostHog = () => {
        try {
          const distinctId =
            localStorage.getItem('ph_anonymous_id') || generateAnonymousId();

          if (!localStorage.getItem('ph_anonymous_id')) {
            localStorage.setItem('ph_anonymous_id', distinctId);
          }

          posthog.init(NEXT_PUBLIC_POSTHOG_KEY!, {
            api_host: NEXT_PUBLIC_POSTHOG_HOST!,
            loaded: (posthog) => {
              if (process.env.NODE_ENV === 'development') {
                posthog.debug();
              }
              posthog.identify(distinctId);
              setIsInitialized(true);
            },
            bootstrap: {
              distinctID: distinctId,
              isIdentifiedID: false,
              featureFlags: {},
            },
            persistence: 'localStorage+cookie',
            autocapture: { dom_event_allowlist: ['click', 'submit'] },
            capture_pageview: true,
            capture_pageleave: true,
            disable_session_recording: isDev,
          });
        } catch (_error) {
          setIsInitialized(true);
          return false;
        }
        return true;
      };

      initPostHog();
    }
  }, [isInitialized, enabled]);

  // Only render provider once initialized
  if (!isInitialized || !enabled) {
    return children;
  }

  return <Provider client={posthog}>{children}</Provider>;
};
