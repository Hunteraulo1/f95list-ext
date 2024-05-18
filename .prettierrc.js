import { prettierConfig } from "./prettier/configs/default.js";
import { prettierConfigSvelte } from "./prettier/configs/svelte.js";

export default {
  ...prettierConfig,
  ...prettierConfigSvelte,
};
