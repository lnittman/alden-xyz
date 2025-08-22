interface ClientConfig {
    baseUrl?: string;
    accessToken?: string | (() => Promise<string | null>);
}
export declare function createClient(config?: ClientConfig): any;
export {};
//# sourceMappingURL=client.d.ts.map