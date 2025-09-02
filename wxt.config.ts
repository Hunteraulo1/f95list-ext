import tailwindcss from '@tailwindcss/vite';
import dotenv from 'dotenv';
import { defineConfig } from 'wxt';
import packageJSON from './package.json';

// Charger les variables d'environnement
dotenv.config();

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  publicDir: 'src/public',
  modulesDir: 'src/modules',
  modules: ['@wxt-dev/module-svelte'],
  manifest: ({ mode }) => ({
    name: 'F95 France - Extension',
    permissions: ['storage', 'unlimitedStorage', 'tabs', 'activeTab'],
    browser_specific_settings: {
      gecko: {
        id: '{9f7488b3-d704-4894-bac8-5dc3068fd6b9}',
        strict_min_version: '79.0',
        update_url: 'https://raw.githubusercontent.com/Hunteraulo1/f95list-ext/main/updates.json',
      },
    },
    version_name: mode === 'development' ? `${packageJSON.version}-dev` : packageJSON.version,
  }),
  webExt: {
    disabled: true,
  },
  vite: ({ mode }) => ({
    plugins: [tailwindcss()],
    build: {
      cssMinify: mode === 'production',
      minify: mode === 'production',
    },
    server: {
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
  }),
});
