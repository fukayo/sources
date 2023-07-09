import { readdirSync } from 'fs'
import { resolve, join } from 'path'

const mode = process.env.NODE_ENV || 'production' // This now exists.

const PACKAGE_ROOT = __dirname

const SOURCESDIR = resolve(__dirname, 'src', 'sources')
const SOURCES = readdirSync(SOURCESDIR)
  .reduce((a, v) => ({ ...a, [`${v.replace(/(src\/)|(\.ts)/g, '')}`]: resolve(SOURCESDIR, v) }), {})

console.log('found the following sources:', Object.keys(SOURCES))

/**
 * @type {import('vite').UserConfig}
 * @see https://vitejs.dev/config/
 */
const config = {
  mode,
  root: PACKAGE_ROOT,
  envDir: process.cwd(),
  publicDir: './src/public',
  resolve: {
    alias: {
      '@abstracts': join(PACKAGE_ROOT, 'src', 'abstracts'),
      '@interfaces': join(PACKAGE_ROOT, 'src', 'interfaces')
    }
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    lib: {
      entry: {
        index: './src/index.ts',
        ...SOURCES
      },
      formats: ['es']
    },
    emptyOutDir: true,
    reportCompressedSize: true,
    ssr: false,
    rollupOptions: {
      preserveEntrySignatures: 'strict',
      external: [
        'fs', 'url', 'path', 'events'
      ],
      output: {
        entryFileNames: '[name].js',
        assetFileNames: '[name].[ext]'

      }
    }
  }
}

export default config
