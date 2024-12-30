import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import webExtension from 'vite-plugin-web-extension';

export default defineConfig({
  plugins: [
    sveltekit(),
    webExtension({
      browser: process.env.TARGET || 'chrome',
    }),
  ],
});
