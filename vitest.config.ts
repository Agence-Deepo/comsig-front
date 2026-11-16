import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { include: ['src/v2/**/*.test.ts', 'src/v2/**/*.test.tsx'], environment: 'node' } });
