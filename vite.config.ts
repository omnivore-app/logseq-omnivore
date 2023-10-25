import { defineConfig } from 'vite'
import logseqDevPlugin from 'vite-plugin-logseq'

export default defineConfig({
  plugins: [logseqDevPlugin()],
  build: {
    target: 'esnext',
    minify: 'esbuild',
  },
})
