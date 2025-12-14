import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

const TARGET = process.env.TARGET || 'chrome';

export default defineConfig({
  plugins: [
    preact(),
    tailwindcss(),
    {
      name: 'firefox-innerhtml-workaround',
      apply: 'build',
      generateBundle(options, bundle) {
        if (TARGET !== 'firefox') return;
        for (const fileName in bundle) {
          const chunk = bundle[fileName];
          if (chunk.type === 'chunk' && chunk.fileName.endsWith('.js')) {
            chunk.code = chunk.code.replace(/\.innerHTML/g, '.textContent');
          }
        }
      }
    }
  ],
  build: {
    outDir: `dist/${TARGET}`,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup.html'),
        background: resolve(__dirname, 'src/background.js'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
  base: './',
  publicDir: 'public',
});
