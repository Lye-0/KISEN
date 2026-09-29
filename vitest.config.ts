import {defineConfig} from 'vitest/config';
export default defineConfig({test:{include:['tests/**/*.test.ts','src/remake/**/*.test.ts'],exclude:['**/node_modules/**','**/.kilo/**','**/dist/**']}});
