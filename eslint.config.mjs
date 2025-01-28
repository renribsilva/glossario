import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"]},
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,

  {
    rules: {
      quotes: [2, "double"], // Aspas duplas
      semi: [2, "always"],   // Sempre usar ponto e vírgula
      curly: [2],            // Chaves em blocos
      "react/no-unknown-property": ["error", { "ignore": ["jsx", "global"] }] // Ignora jsx e global
    },
  }
];