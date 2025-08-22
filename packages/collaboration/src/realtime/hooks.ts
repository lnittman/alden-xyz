import { useCallback, useEffect } from 'react';
import { useRealtimeContext } from './provider';
import type { RealtimeEvent } from './types';

export function useRealtimeEvent(
  eventType: string,
  handler: (event: RealtimeEvent) => void
) {
  const { client } = useRealtimeContext();

  useEffect(() => {
    if (!client) {
      return;
    }

    const unsubscribe = client.onEvent(eventType, handler);
    return unsubscribe;
  }, [client, eventType, handler]);
}

export function useBroadcastEvent() {
  const { client } = useRealtimeContext();

  const broadcast = useCallback(
    (event: Omit<RealtimeEvent, 'timestamp'>) => {
      if (!client) {
        return;
      }

      client.broadcast(event);
    },
    [client]
  );

  return broadcast;
}
