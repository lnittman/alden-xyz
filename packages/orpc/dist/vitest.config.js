import path from 'node:path';
import { defineConfig } from 'vitest/config';
export default defineConfig({
    test: {
        environment: 'node',
        globals: true,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'dist/',
                '*.config.ts',
                '**/*.d.ts',
                '**/__tests__/**',
                '**/types/**',
            ],
        },
        include: [
            '__tests__/**/*.test.ts',
            'src/**/__tests__/**/*.test.ts',
            'src/**/*.test.ts',
        ],
        exclude: ['node_modules', 'dist'],
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './'),
            '@repo': path.resolve(__dirname, '../../packages'),
        },
    },
});
