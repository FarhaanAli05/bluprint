import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync } from 'fs';

export default defineConfig(({ command }) => {
  const isContentScript = process.env.BUILD_TARGET === 'content';
  
  return {
    base: './', // Use relative paths for Chrome extension
    plugins: [
      react(),
      {
        name: 'copy-manifest',
        closeBundle() {
          copyFileSync('manifest.json', 'dist/manifest.json');
        }
      }
    ],
    build: {
      outDir: 'dist',
      emptyOutDir: !isContentScript, // Don't empty dist when building content script
      rollupOptions: {
        input: isContentScript 
          ? 'src/content/content.js'
          : 'index.html',
        output: isContentScript
          ? {
              entryFileNames: 'content.js',
              chunkFileNames: '[name].js',
              assetFileNames: '[name].[ext]',
              format: 'iife',
              name: 'content'
            }
          : {
              entryFileNames: '[name].js',
              chunkFileNames: '[name].js',
              assetFileNames: '[name].[ext]'
            }
      }
    },
    publicDir: 'public'
  };
});
