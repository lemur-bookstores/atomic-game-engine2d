import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
    plugins: [
        dts({
            insertTypesEntry: true,
            include: ['src/**/*'],
            exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
            copyDtsFiles: true,
            outDir: 'dist',
            tsconfigPath: './tsconfig.build.json',
            // rollupTypes: true,
            // ✅ Bundle todos los tipos en un solo archivo
            bundledPackages: ['*'],
        })
    ],

    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'AtomicGameEngine2D',
            formats: ['es', 'cjs', 'umd'],
            fileName: (format, entryName) => {
                console.log({ entryName });

                switch (format) {
                    case 'es':
                        return 'index.esm.js';
                    case 'cjs':
                        return 'index.cjs.js';
                    case 'umd':
                        return 'index.umd.js';
                    default:
                        return `index.${format}.js`;
                }
            }
        },
        rollupOptions: {
            // ✅ Optimización de tamaño
            treeshake: {
                moduleSideEffects: false
            },
            // ✅ Dependencias externas (no bundlear con la librería)
            external: [
                'box2d-wasm',
                'gl-matrix',
                // Agregar otras dependencias que los usuarios deben instalar
            ],
            output: [
                // ✅ ES Modules (moderno)
                {
                    format: 'es',
                    entryFileNames: 'index.esm.js',
                    dir: 'dist',
                    preserveModules: false,
                },
                // ✅ CommonJS (Node.js)
                {
                    format: 'cjs',
                    entryFileNames: 'index.cjs.js',
                    dir: 'dist',
                    exports: 'named',
                },
                // ✅ UMD (Browser global)
                {
                    format: 'umd',
                    entryFileNames: 'index.umd.js',
                    dir: 'dist',
                    name: 'AtomicGameEngine2D',
                    globals: {
                        'box2d-wasm': 'Box2D',
                        'gl-matrix': 'glMatrix'
                    }
                }
            ]
        },
        // ✅ Configuración optimizada
        sourcemap: true,
        minify: false, // Los consumers pueden minificar
        target: 'es2018', // Compatibilidad amplia
        emptyOutDir: true,
    },

    resolve: {
        alias: {
            '@': resolve(__dirname, './src')
        }
    },

    // ✅ Solo para desarrollo
    server: {
        open: '/examples/index.html'
    },

    // ✅ Optimizaciones para dependencias
    optimizeDeps: {
        include: ['gl-matrix'],
        exclude: ['box2d-wasm']
    }
});