import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/modules/pricing/index.ts',
    'src/modules/messaging/index.ts',
    'src/modules/operations/index.ts',
    'src/modules/analytics/index.ts',
    'src/modules/integrations/index.ts',
  ],
  format: ['esm'],
  dts: true,
  clean: true,
  splitting: true,
  treeshake: true,
  sourcemap: true,
});
