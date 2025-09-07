import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],

    // ✅ Configuración para TypeScript y .d.ts
    typecheck: {
      enabled: true,
      // Incluir tests de tipos
      include: ['**/*.{test,spec}-d.{ts,tsx}', 'src/**/*.d.ts'],
      // Usar tsconfig específico para tests
      tsconfig: './tsconfig.test.json'
    },

    // ✅ Incluir archivos de test
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],

    // ✅ Configuración de coverage
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
    // ✅ Incluir archivos .d.ts en el procesamiento
    include: /\.(m?[jt]sx?|json)$/,
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