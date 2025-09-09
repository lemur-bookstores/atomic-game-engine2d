import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],

    coverage: {
      include: ['src/**/*'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.ts',
        'src/**/*.spec.ts'
      ]
    }
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@types': resolve(__dirname, './src/types'),
      '@core': resolve(__dirname, './src/core'),
      '@ecs': resolve(__dirname, './src/ecs')
    },
  },

  esbuild: {
    loader: 'ts',
    include: [],
    exclude: []
  },

  define: {
    'process.env.NODE_ENV': '"test"',
  },
});

// export default defineConfig({
//   test: {
//     environment: 'jsdom',
//     globals: true,
//     setupFiles: ['./tests/setup.ts'],
//   },
//   resolve: {
//     alias: {
//       '@': resolve(__dirname, './src'),
//     },
//   },
//   esbuild: {
//     loader: 'ts',
//     include: ['./src/types/*.d.ts'],
//   },
//   define: {
//     'process.env.NODE_ENV': '"test"',
//   },

// });