'use client';

import { useEffect, useState } from 'react';

/**
 * Detect if the browser is Safari on iOS
 */
export function useIsIOSSafari() {
  const [isIOSSafari, setIsIOSSafari] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
    
    setIsIOSSafari(isIOS && isSafari);
  }, []);

  return isIOSSafari;
}

/**
 * CSS transform for GPU acceleration on Safari
 * Helps with performance issues on iOS Safari
 */
export const safariGPUAcceleration = {
  transform: 'translateZ(0)',
  willChange: 'transform',
  '-webkit-transform': 'translateZ(0)',
  '-webkit-backface-visibility': 'hidden',
  'backface-visibility': 'hidden',
} as const;