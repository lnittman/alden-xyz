/// <reference path="../types/swr-shim.d.ts" />
// Mark as client-only to avoid server compilation requiring 'swr' types in non-app packages
// During build, consumers are expected to transpile this file within Next.js app context
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import useSWR, { type SWRConfiguration, mutate } from 'swr';
import type { AppRouter } from '../router';

// Type helpers for router paths
type RouterPaths<T> = {
  [K in keyof T]: T[K] extends { input: any; output: any }
    ? K extends string
      ? K
      : never
    : T[K] extends object
      ? K extends string
        ? `${K}.${RouterPaths<T[K]>}` | K
        : never
      : never;
}[keyof T];

type RouterInput<T, P extends string> = P extends `${infer First}.${infer Rest}`
  ? First extends keyof T
    ? T[First] extends object
      ? RouterInput<T[First], Rest>
      : never
    : never
  : P extends keyof T
    ? T[P] extends { input: infer I }
      ? I
      : never
    : never;

type RouterOutput<
  T,
  P extends string,
> = P extends `${infer First}.${infer Rest}`
  ? First extends keyof T
    ? T[First] extends object
      ? RouterOutput<T[First], Rest>
      : never
    : never
  : P extends keyof T
    ? T[P] extends { output: infer O }
      ? O
      : never
    : never;

// Custom hook for ORPC queries with SWR
export function useORPCQuery<
  TPath extends RouterPaths<AppRouter>,
  TData = RouterOutput<AppRouter, TPath>,
>(
  path: TPath,
  input: RouterInput<AppRouter, TPath>,
  config?: SWRConfiguration<TData, Error> & {
    enabled?: boolean;
  }
) {
  const key = config?.enabled !== false ? [path, input] : null;

  const swr: any = useSWR;
  return swr(
    key,
    async (_tuple: [string, any]) => {
      // This will be replaced with actual client call in the provider
      throw new Error('useORPCQuery must be used within ORPCProvider');
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      ...(config as any),
    }
  );
}

// Custom hook for ORPC mutations
export function useORPCMutation<
  TPath extends RouterPaths<AppRouter>,
  TData = RouterOutput<AppRouter, TPath>,
  TInput = RouterInput<AppRouter, TPath>,
>(_path: TPath) {
  const mutateAsync = async (_input: TInput): Promise<TData> => {
    // This will be replaced with actual client call in the provider
    throw new Error('useORPCMutation must be used within ORPCProvider');
  };

  const invalidate = (keys?: string[]) => {
    if (keys) {
      keys.forEach((key) => mutate(key));
    } else {
      // Invalidate all SWR cache
      mutate(() => true);
    }
  };

  return {
    mutateAsync,
    invalidate,
  };
}

// Factory function to create ORPC hooks with client
export function createORPCHooks(client: any): {
  useQuery: <TPath extends RouterPaths<AppRouter>>(
    path: TPath,
    input: RouterInput<AppRouter, TPath>,
    config?: SWRConfiguration & { enabled?: boolean }
  ) => ReturnType<typeof useSWR>;
  useMutation: <TPath extends RouterPaths<AppRouter>>(
    path: TPath
  ) => {
    mutateAsync: (input: RouterInput<AppRouter, TPath>) => Promise<any>;
    invalidate: (keys?: string[]) => void;
  };
} {
  return {
    useQuery: <TPath extends RouterPaths<AppRouter>>(
      path: TPath,
      input: RouterInput<AppRouter, TPath>,
      config?: SWRConfiguration & { enabled?: boolean }
    ) => {
      const key = config?.enabled !== false ? [path, input] : null;

      const swr: any = useSWR;
      return swr(
        key,
        async ([path, input]: [string, any]) => {
          const segments = path.split('.');
          let procedure: any = client;

          for (const segment of segments) {
            procedure = procedure?.[segment];
          }

          if (!procedure || typeof procedure !== 'function') {
            throw new Error(`Procedure not found: ${path}`);
          }

          return procedure(input);
        },
        {
          revalidateOnFocus: false,
          revalidateOnReconnect: false,
          ...(config as any),
        }
      );
    },

    useMutation: <TPath extends RouterPaths<AppRouter>>(path: TPath) => {
      const mutateAsync = async (input: RouterInput<AppRouter, TPath>) => {
        const segments = path.split('.');
        let procedure: any = client;

        for (const segment of segments) {
          procedure = procedure?.[segment];
        }

        if (!procedure || typeof procedure !== 'function') {
          throw new Error(`Procedure not found: ${path}`);
        }

        return procedure(input);
      };

      const invalidate = (keys?: string[]) => {
        if (keys) {
          keys.forEach((key) => mutate(key));
        } else {
          mutate(() => true);
        }
      };

      return {
        mutateAsync,
        invalidate,
      };
    },
  };
}
