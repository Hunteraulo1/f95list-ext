import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'wxt';
import packageJson from './package.json';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-svelte'],
  manifest: {
    name: 'F95 France - Extension',
    permissions: ['storage', 'unlimitedStorage', 'tabs'],
    browser_specific_settings: {
      gecko: {
        id: '{9f7488b3-d704-4894-bac8-5dc3068fd6b9}',
        strict_min_version: '79.0',
        update_url: 'https://raw.githubusercontent.com/Hunteraulo1/f95list-ext/main/updates.json',
      },
    },
    version_name: import.meta.env.DEV ? `${packageJson.version}-dev` : packageJson.version,
  },
  runner: {
    disabled: true,
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
