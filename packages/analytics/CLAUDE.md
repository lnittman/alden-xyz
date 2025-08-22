# @repo/analytics Package Context

## Development Standards

### Package Context
This package provides analytics tracking capabilities for the Squish ecosystem, integrating with PostHog and Vercel Analytics. It offers a unified API for tracking user events, page views, and custom metrics across all applications.

### Technology Stack
- **PostHog**: 1.205.0 - Product analytics and event tracking
- **Vercel Analytics**: Web vitals and performance metrics
- **React**: 19+ compatibility
- **TypeScript**: 5.7+ strict configuration

### Key Dependencies
```json
{
  "dependencies": {
    "posthog-js": "^1.205.0",
    "@vercel/analytics": "^1.5.0",
    "@repo/auth": "workspace:*",
    "react": "^19.1.0"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*"
  }
}
```

## Package Structure

### Directory Layout
```
src/
├── index.ts              # Main package exports
├── providers/            # Analytics provider configurations
│   ├── posthog.ts       # PostHog provider setup
│   ├── vercel.ts        # Vercel Analytics setup
│   └── index.ts         # Provider exports
├── hooks/                # React hooks for analytics
│   ├── useAnalytics.ts  # Main analytics hook
│   ├── useEventTracking.ts # Event tracking hook
│   ├── usePageView.ts   # Page view tracking
│   └── index.ts         # Hook exports
├── events/               # Event definitions and types
│   ├── user.ts          # User-related events
│   ├── board.ts         # Board-related events
│   ├── asset.ts         # Asset-related events
│   ├── search.ts        # Search-related events
│   └── index.ts         # Event exports
├── utils/                # Utility functions
│   ├── identifiers.ts   # User session identification
│   ├── properties.ts    # Event properties
│   ├── filtering.ts     # Data filtering for privacy
│   └── index.ts         # Utility exports
└── types/                # TypeScript type definitions
    ├── events.ts        # Event types
    ├── providers.ts     # Provider types
    ├── properties.ts    # Property types
    └── index.ts         # Type exports
```

## Analytics Provider Patterns

### PostHog Integration
```typescript
// src/providers/posthog.ts
import posthog from 'posthog-js';

export class PostHogProvider {
  private initialized = false;
  
  init(apiKey: string, options?: {
    apiHost?: string;
    autocapture?: boolean;
    capturePageview?: boolean;
    capturePageleave?: boolean;
  }) {
    if (this.initialized) return;
    
    posthog.init(apiKey, {
      apiHost: options?.apiHost || 'https://app.posthog.com',
      autocapture: options?.autocapture ?? false,
      capture_pageview: options?.capturePageview ?? false,
      capture_pageleave: options?.capturePageleave ?? true,
      loaded: (posthog) => {
        // Custom initialization logic
        console.log('PostHog loaded successfully');
      },
    });
    
    this.initialized = true;
  }
  
  capture(event: string, properties?: Record<string, any>) {
    if (!this.initialized) {
      console.warn('PostHog not initialized');
      return;
    }
    
    posthog.capture(event, {
      ...properties,
      timestamp: new Date().toISOString(),
    });
  }
  
  identify(userId: string, properties?: Record<string, any>) {
    if (!this.initialized) return;
    
    posthog.identify(userId, {
      ...properties,
      $created: new Date().toISOString(),
    });
  }
  
  reset() {
    posthog.reset();
  }
  
  optOut() {
    posthog.opt_out_capturing();
  }
  
  optIn() {
    posthog.opt_in_capturing();
  }
}
```

### Vercel Analytics Integration
```typescript
// src/providers/vercel.ts
import { Analytics } from '@vercel/analytics/react';

export class VercelAnalyticsProvider {
  private enabled = process.env.NODE_ENV === 'production';
  
  getAnalyticsComponent() {
    if (!this.enabled) return null;
    
    return <Analytics
      beforeSend={(event) => {
        // Filter sensitive URLs
        if (event.url.includes('/api/')) {
          return null;
        }
        return event;
      }}
    />;
  }
  
  trackWebVitals(metric: any) {
    if (!this.enabled) return;
    
    // Send web vitals to custom analytics
    this.capture('web_vital', {
      name: metric.name,
      value: metric.value,
      id: metric.id,
    });
  }
}
```

## React Hooks Patterns

### Main Analytics Hook
```typescript
// src/hooks/useAnalytics.ts
interface UseAnalyticsOptions {
  enabled?: boolean;
  debug?: boolean;
}

export function useAnalytics(options: UseAnalyticsOptions = {}) {
  const { enabled = true, debug = false } = options;
  const { user } = useAuth();
  
  useEffect(() => {
    if (!enabled || !user) return;
    
    // Identify user in analytics
    analytics.identify(user.id, {
      email: user.email,
      name: user.name,
      created_at: user.createdAt,
    });
  }, [user, enabled]);
  
  const capture = useCallback((event: string, properties?: Record<string, any>) => {
    if (!enabled) {
      if (debug) {
        console.log('[Analytics Debug]', event, properties);
      }
      return;
    }
    
    analytics.capture(event, {
      ...properties,
      user_id: user?.id,
      timestamp: new Date().toISOString(),
    });
  }, [enabled, user, debug]);
  
  const pageView = useCallback((path: string, properties?: Record<string, any>) => {
    capture('page_view', {
      path,
      referrer: document.referrer,
      ...properties,
    });
  }, [capture]);
  
  return {
    capture,
    pageView,
    identify: analytics.identify.bind(analytics),
    reset: analytics.reset.bind(analytics),
  };
}
```

### Event-Specific Hooks
```typescript
// src/hooks/useEventTracking.ts
export function useBoardEvents() {
  const analytics = useAnalytics();
  
  const trackBoardCreated = useCallback((boardId: string, boardName: string) => {
    analytics.capture('board_created', {
      board_id: boardId,
      board_name: boardName,
    });
  }, [analytics]);
  
  const trackBoardUpdated = useCallback((boardId: string, changes: Record<string, any>) => {
    analytics.capture('board_updated', {
      board_id: boardId,
      changed_fields: Object.keys(changes),
    });
  }, [analytics]);
  
  const trackBoardDeleted = useCallback((boardId: string) => {
    analytics.capture('board_deleted', {
      board_id: boardId,
    });
  }, [analytics]);
  
  return {
    trackBoardCreated,
    trackBoardUpdated,
    trackBoardDeleted,
  };
}
```

## Event Definitions

### Event Type System
```typescript
// src/events/index.ts
type UserEvent = 
  | { type: 'user_signed_up'; properties: UserSignupProperties }
  | { type: 'user_signed_in'; properties: UserSignInProperties }
  | { type: 'user_signed_out'; properties: {} };

type BoardEvent = 
  | { type: 'board_created'; properties: BoardCreatedProperties }
  | { type: 'board_viewed'; properties: BoardViewedProperties }
  | { type: 'board_updated'; properties: BoardUpdatedProperties }
  | { type: 'board_deleted'; properties: BoardDeletedProperties };

type AssetEvent = 
  | { type: 'asset_uploaded'; properties: AssetUploadedProperties }
  | { type: 'asset_viewed'; properties: AssetViewedProperties }
  | { type: 'asset_deleted'; properties: AssetDeletedProperties };

type AnalyticsEvent = UserEvent | BoardEvent | AssetEvent;
```

### Event Properties
```typescript
// src/events/user.ts
export interface UserSignupProperties {
  method: 'email' | 'google' | 'github';
  referral_code?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

export interface UserSignInProperties {
  method: 'email' | 'google' | 'github' | 'sso';
  session_duration?: number; // in seconds
}
```

## Privacy and Filtering

### Data Filtering
```typescript
// src/utils/filtering.ts
export function filterSensitiveData(properties: Record<string, any>): Record<string, any> {
  const sensitiveFields = [
    'password',
    'token',
    'secret',
    'key',
    'authorization',
    'cookie',
  ];
  
  const filtered = { ...properties };
  
  // Remove sensitive fields
  for (const field of sensitiveFields) {
    if (filtered[field]) {
      filtered[field] = '[REDACTED]';
    }
  }
  
  // Filter email domains for privacy
  if (filtered.email) {
    const [, domain] = filtered.email.split('@');
    filtered.email_domain = domain;
    delete filtered.email;
  }
  
  return filtered;
}
```

## Integration Patterns

### App Integration
```typescript
// In apps/app/src/app/layout.tsx
import { AnalyticsProvider } from '@repo/analytics';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AnalyticsProvider
      posthogApiKey={process.env.NEXT_PUBLIC_POSTHOG_KEY}
      vercelEnabled={true}
    >
      {children}
    </AnalyticsProvider>
  );
}
```

### Component Usage
```typescript
// In a component
import { useAnalytics } from '@repo/analytics';
import { useBoardEvents } from '@repo/analytics/hooks';

function CreateBoardModal() {
  const analytics = useAnalytics();
  const { trackBoardCreated } = useBoardEvents();
  
  const handleCreateBoard = async (name: string) => {
    const board = await createBoard(name);
    
    // Track generic event
    analytics.capture('modal_submitted', {
      modal_type: 'create_board',
      success: true,
    });
    
    // Track specific board event
    trackBoardCreated(board.id, board.name);
    
    // Track page view
    analytics.pageView(`/board/${board.id}`);
  };
  
  return (
    <Modal>
      {/* Modal content */}
    </Modal>
  );
}
```

## Common Tasks

### Adding a New Event Type
1. Define event in appropriate file in `src/events/`
2. Add TypeScript interface for properties
3. Create hook in `src/hooks/` if needed
4. Export from index files
5. Update documentation

### Adding Analytics to a Component
1. Import appropriate hooks
2. Call tracking functions at key moments
3. Add relevant properties
4. Test events fire correctly
5. Verify in analytics dashboard

### Setting Up New Analytics Provider
1. Create provider class in `src/providers/`
2. Implement required methods (init, capture, etc.)
3. Add provider to main analytics class
4. Export from provider index
5. Update integration documentation

## Files to Know
- `src/providers/posthog.ts` - PostHog integration
- `src/hooks/useAnalytics.ts` - Main analytics hook
- `src/events/index.ts` - Event type definitions
- `src/utils/filtering.ts` - Privacy filtering

## Quality Checklist

Before committing changes to this package:
- [ ] All events have proper TypeScript definitions
- [ ] Sensitive data is properly filtered
- [ ] Event names follow consistent naming convention
- [ ] Hook dependencies are optimized
- [ ] Privacy preferences are respected
- [ ] Debug mode works for development
- [ ] Events fire at appropriate times
- [ ] No PII in event properties
- [ ] Analytics providers initialized correctly
- [ ] Documentation updated for new events

---

*This context ensures Claude Code understands the analytics package structure and patterns when working on tracking features.*