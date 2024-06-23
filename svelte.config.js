import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
// eslint-disable-next-line import/default
import adapter from 'sveltekit-adapter-chrome-extension'

const buildMode = process.env.BUILD_MODE

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
    // If your environment is not supported or you settled on a specific environment, switch out the adapter.
    // See https://kit.svelte.dev/docs/adapters for more information about adapters.
    adapter: adapter({
      pages: `builds/${buildMode}`,
      assets: `builds/${buildMode}`,
      fallback: null,
      precompress: false,
      manifest: `manifest_${buildMode}.json`,
    }),
    appDir: 'app',
  },
}

export default config
