'use client';

import { ClerkProvider, useAuth } from '@clerk/nextjs';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ConvexReactClient } from 'convex/react';
import { dark } from '@clerk/themes';
import type { Theme } from '@clerk/types';
import { useTheme } from 'next-themes';
import type { ComponentProps, ReactNode } from 'react';

// Initialize Convex client
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface ConvexAuthProviderProps extends Omit<ComponentProps<typeof ClerkProvider>, 'children'> {
  children: ReactNode;
}

/**
 * Unified auth provider that integrates Clerk with Convex
 * This replaces separate Clerk and Convex providers with a single integrated solution
 */
export const ConvexAuthProvider = ({
  children,
  ...clerkProps
}: ConvexAuthProviderProps) => {
  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === 'dark';
  const baseTheme = isDark ? dark : undefined;

  const elements: Theme['elements'] = {
    formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    rootBox: 'w-full mx-auto',
    card: 'bg-card hover:bg-card/80 border-border',
    socialButtonsIconButton: 'bg-muted hover:bg-muted/80',
    dividerRow: 'text-white',
    dividerText: 'text-white',
    formFieldInput: 'bg-card border-border',
    footerActionLink: 'text-primary hover:text-primary/80',
    identityPreview: 'bg-card',
    formFieldLabel: 'text-white',
    formButtonReset: 'text-white hover:text-white/80',
    navbar: 'hidden',
    socialButtonsBlockButton: 'text-white',
    formFieldLabelRow: 'text-white',
    headerTitle: 'text-white',
    headerSubtitle: 'text-white',
    profileSectionTitle: 'text-white',
    otpCodeFieldInput: 'text-white',
    dividerLine: 'bg-border',
    navbarButton: 'text-foreground',
    organizationSwitcherTrigger__open: 'bg-background',
    organizationPreviewMainIdentifier: 'text-foreground',
    organizationSwitcherTriggerIcon: 'text-muted-foreground',
    organizationPreview__organizationSwitcherTrigger: 'gap-2',
    organizationPreviewAvatarContainer: 'shrink-0',
  };

  const variables: Theme['variables'] = {
    colorPrimary: 'var(--primary)',
    colorText: '#ffffff',
    colorTextSecondary: '#ffffff',
    colorBackground: 'var(--background)',
    colorInputBackground: 'var(--card)',
    colorInputText: '#ffffff',
    colorTextOnPrimaryBackground: '#000000',
  };

  return (
    <ClerkProvider
      {...clerkProps}
      appearance={{ baseTheme, elements, variables }}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/"
      afterSignInUrl="/"
      afterSignUpUrl="/"
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
};