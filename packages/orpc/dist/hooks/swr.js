/// <reference path="../types/swr-shim.d.ts" />
// Mark as client-only to avoid server compilation requiring 'swr' types in non-app packages
// During build, consumers are expected to transpile this file within Next.js app context
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import useSWR, { mutate } from 'swr';
// Custom hook for ORPC queries with SWR
export function useORPCQuery(path, input, config) {
    const key = config?.enabled !== false ? [path, input] : null;
    const swr = useSWR;
    return swr(key, async (_tuple) => {
        // This will be replaced with actual client call in the provider
        throw new Error('useORPCQuery must be used within ORPCProvider');
    }, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        ...config,
    });
}
// Custom hook for ORPC mutations
export function useORPCMutation(_path) {
    const mutateAsync = async (_input) => {
        // This will be replaced with actual client call in the provider
        throw new Error('useORPCMutation must be used within ORPCProvider');
    };
    const invalidate = (keys) => {
        if (keys) {
            keys.forEach((key) => mutate(key));
        }
        else {
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
export function createORPCHooks(client) {
    return {
        useQuery: (path, input, config) => {
            const key = config?.enabled !== false ? [path, input] : null;
            const swr = useSWR;
            return swr(key, async ([path, input]) => {
                const segments = path.split('.');
                let procedure = client;
                for (const segment of segments) {
                    procedure = procedure?.[segment];
                }
                if (!procedure || typeof procedure !== 'function') {
                    throw new Error(`Procedure not found: ${path}`);
                }
                return procedure(input);
            }, {
                revalidateOnFocus: false,
                revalidateOnReconnect: false,
                ...config,
            });
        },
        useMutation: (path) => {
            const mutateAsync = async (input) => {
                const segments = path.split('.');
                let procedure = client;
                for (const segment of segments) {
                    procedure = procedure?.[segment];
                }
                if (!procedure || typeof procedure !== 'function') {
                    throw new Error(`Procedure not found: ${path}`);
                }
                return procedure(input);
            };
            const invalidate = (keys) => {
                if (keys) {
                    keys.forEach((key) => mutate(key));
                }
                else {
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
