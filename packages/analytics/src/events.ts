'use client';

import posthog from 'posthog-js';

// Page view events
export const trackPageView = (path: string, props?: Record<string, any>) => {
  posthog.capture('$pageview', {
    path,
    ...props,
  });
};

// Authentication events
export const trackAuthEvent = (
  event: 'sign_in' | 'sign_up' | 'sign_out' | 'password_reset',
  props?: Record<string, any>
) => {
  posthog.capture(`auth_${event}`, {
    ...props,
  });
};

// User interaction events
export const trackInteraction = (
  element: string,
  action: 'click' | 'hover' | 'submit',
  props?: Record<string, any>
) => {
  posthog.capture('user_interaction', {
    element,
    action,
    ...props,
  });
};

// Feature usage events
export const trackFeatureUsage = (
  feature: string,
  action: 'view' | 'start' | 'complete' | 'error',
  props?: Record<string, any>
) => {
  posthog.capture('feature_usage', {
    feature,
    action,
    ...props,
  });
};

// Error events
export const trackError = (
  error: Error,
  context: string,
  props?: Record<string, any>
) => {
  posthog.capture('error_occurred', {
    error_name: error.name,
    error_message: error.message,
    error_stack: error.stack,
    context,
    ...props,
  });
};
