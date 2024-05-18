const tsEslint = require('typescript-eslint');
const { eslintConfigTypescript } = require('config-aeryle/eslint/configs/index.cjs');
const {
  eslintConfigTypescript,
  eslintConfigCommonJS,
  eslintConfigEs,
  eslintConfigImport,
} = require("config-aeryle/eslint/configs/index.cjs");

module.exports = tsEslint.config(
  ...eslintConfigTypescript,
  ...eslintConfigCommonJS,
  ...eslintConfigEsm,
  ...eslintConfigImport,
);
