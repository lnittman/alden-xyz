'use client';

import { useCallback, useRef, useState } from 'react';

export interface UseStreamingTextOptions {
  onComplete?: () => void;
  streamSpeed?: number;
}

export function useStreamingText({
  onComplete,
  streamSpeed = 0,
}: UseStreamingTextOptions = {}) {
  const [displayedText, setDisplayedText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const streamText = useCallback(
    async (text: string) => {
      // Cancel any ongoing streaming
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create a new AbortController for this stream
      abortControllerRef.current = new AbortController();
      const { signal } = abortControllerRef.current;

      setDisplayedText('');
      setIsStreaming(true);

      if (streamSpeed === 0) {
        // Instant display
        setDisplayedText(text);
        setIsStreaming(false);
        onComplete?.();
        return;
      }

      // Stream the text character by character
      for (let i = 0; i <= text.length; i++) {
        if (signal.aborted) break;

        setDisplayedText(text.slice(0, i));

        if (i < text.length) {
          await new Promise(resolve => setTimeout(resolve, streamSpeed));
        }
      }

      if (!signal.aborted) {
        setIsStreaming(false);
        onComplete?.();
      }
    },
    [streamSpeed, onComplete]
  );

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  return {
    displayedText,
    isStreaming,
    streamText,
    stopStreaming,
  };
}