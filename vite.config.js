const mode = process.env.NODE_ENV || 'production' // This now exists.

const PACKAGE_ROOT = __dirname

/**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config/
 */
const config = {
  mode,
  root: PACKAGE_ROOT,
  envDir: process.cwd(),
  publicDir: './src/public',
  build: {
    target: 'esnext',
    outDir: 'dist',
    lib: {
      entry: './src/index.ts',
      formats: ['es']
    },
    emptyOutDir: true,
    reportCompressedSize: true,
    ssr: true,
    rollupOptions: {
      external: [
        '../index.js'
      ],
      output: {
        entryFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
        chunkFileNames: (id) => id.name.replace(/\.ts$|\.json$/, '.js'),
        manualChunks: (id) => id.split('/src/')[1]
      }
    }
  }
}

export default config
