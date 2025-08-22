import useSWR, { type SWRConfiguration } from 'swr';
import type { AppRouter } from '../router';
type RouterPaths<T> = {
    [K in keyof T]: T[K] extends {
        input: any;
        output: any;
    } ? K extends string ? K : never : T[K] extends object ? K extends string ? `${K}.${RouterPaths<T[K]>}` | K : never : never;
}[keyof T];
type RouterInput<T, P extends string> = P extends `${infer First}.${infer Rest}` ? First extends keyof T ? T[First] extends object ? RouterInput<T[First], Rest> : never : never : P extends keyof T ? T[P] extends {
    input: infer I;
} ? I : never : never;
type RouterOutput<T, P extends string> = P extends `${infer First}.${infer Rest}` ? First extends keyof T ? T[First] extends object ? RouterOutput<T[First], Rest> : never : never : P extends keyof T ? T[P] extends {
    output: infer O;
} ? O : never : never;
export declare function useORPCQuery<TPath extends RouterPaths<AppRouter>, TData = RouterOutput<AppRouter, TPath>>(path: TPath, input: RouterInput<AppRouter, TPath>, config?: SWRConfiguration<TData, Error> & {
    enabled?: boolean;
}): any;
export declare function useORPCMutation<TPath extends RouterPaths<AppRouter>, TData = RouterOutput<AppRouter, TPath>, TInput = RouterInput<AppRouter, TPath>>(_path: TPath): {
    mutateAsync: (_input: TInput) => Promise<TData>;
    invalidate: (keys?: string[]) => void;
};
export declare function createORPCHooks(client: any): {
    useQuery: <TPath extends RouterPaths<AppRouter>>(path: TPath, input: RouterInput<AppRouter, TPath>, config?: SWRConfiguration & {
        enabled?: boolean;
    }) => ReturnType<typeof useSWR>;
    useMutation: <TPath extends RouterPaths<AppRouter>>(path: TPath) => {
        mutateAsync: (input: RouterInput<AppRouter, TPath>) => Promise<any>;
        invalidate: (keys?: string[]) => void;
    };
};
export {};
//# sourceMappingURL=swr.d.ts.map