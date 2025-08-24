import { Knock } from '@knocklabs/node';
import { keys } from './keys';

const key = keys().KNOCK_SECRET_API_KEY;

export const notifications = new Knock(key);

// Re-export Knock types for convenience
export type { Knock } from '@knocklabs/node';

// Export client components
export { KnockProvider, KnockFeedProvider } from '@knocklabs/react';
export type { Feed, FeedItem } from '@knocklabs/react';