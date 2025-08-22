'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { trackPageView } from './events';

export const usePageView = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      const url = searchParams?.size
        ? `${pathname}?${searchParams.toString()}`
        : pathname;

      trackPageView(url, {
        referrer: document.referrer,
        title: document.title,
      });
    }
  }, [pathname, searchParams]);
};

export const useTrackMounted = (
  componentName: string,
  props?: Record<string, any>
) => {
  useEffect(() => {
    trackPageView(`component_mounted_${componentName}`, props);
  }, [componentName, props]);
};
