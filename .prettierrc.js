import { prettierConfig } from 'config-aeryle/prettier/configs/default.js'
import { prettierConfigSvelte } from 'config-aeryle/prettier/configs/svelte.js'

export default {
  ...prettierConfig,
  ...prettierConfigSvelte,
}
