declare module 'swr' {
  // Minimal shim so packages depending on @repo/orpc can typecheck without SWR installed
  export type SWRConfiguration<Data = any, Error = any> = Record<string, any>;
  const useSWR: any;
  export default useSWR;
  export const mutate: any;
}
