import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';

interface ClientConfig {
  baseUrl?: string;
  accessToken?: string | (() => Promise<string | null>);
}

export function createClient(config?: ClientConfig) {
  const link = new RPCLink({
    url: () => {
      const baseUrl =
        config?.baseUrl ||
        (typeof window !== 'undefined'
          ? window.location.origin
          : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787');
      return `${baseUrl}/api/orpc`;
    },
    headers: async () => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Handle access token
      if (config?.accessToken) {
        const token =
          typeof config.accessToken === 'function'
            ? await config.accessToken()
            : config.accessToken;

        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
      }

      return headers;
    },
  });

  return createORPCClient<any>(link);
}
