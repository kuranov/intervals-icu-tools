import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  outDir: 'dist',
  outExtension({ format }) {
    return format === 'esm' ? { js: '.mjs' } : { js: '.cjs' };
  },
});


