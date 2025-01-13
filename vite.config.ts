import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'node:path';
import { defineConfig } from 'vite';
import webExtension, { readJsonFile } from 'vite-plugin-web-extension';

const generateManifest = () => {
  const manifest = readJsonFile('src/manifest.json');
  const pkg = readJsonFile('package.json');

  return {
    author: pkg.author.name,
    description: pkg.description,
    version: pkg.version,
    ...manifest,
  };
};

export default defineConfig({
  plugins: [
    svelte(),
    webExtension({
      manifest: generateManifest,
      watchFilePaths: ['package.json', 'manifest.json'],
      browser: process.env.TARGET,
      disableAutoLaunch: true,
    }),
  ],
  resolve: {
    alias: {
      $ui: path.resolve('./src/lib/components/ui'),
      $components: path.resolve('./src/lib/components'),
      $utils: path.resolve('./src/lib/utils'),
      $lib: path.resolve('./src/lib'),
    },
  },
  build: {
    outDir: `./builds/${process.env.TARGET}`,
  },
});
