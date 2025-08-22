import type { SWRConfiguration } from 'swr';
import type { AppRouter } from '../router';
export declare function useORPCQuery<TPath extends string, TData = any>(
  path: TPath,
  input: any,
  config?: SWRConfiguration<TData, Error> & { enabled?: boolean }
): any;
export declare function useORPCMutation<TPath extends string, TData = any, TInput = any>(
  path: TPath
): {
  mutateAsync: (input: TInput) => Promise<TData>;
  invalidate: (keys?: string[]) => void;
};
export declare function createORPCHooks(client: any): {
  useQuery: <TPath extends string>(
    path: TPath,
    input: any,
    config?: SWRConfiguration & { enabled?: boolean }
  ) => any;
  useMutation: <TPath extends string>(
    path: TPath
  ) => {
    mutateAsync: (input: any) => Promise<any>;
    invalidate: (keys?: string[]) => void;
  };
}
