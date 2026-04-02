import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";

export default [
  { ignores: ["dist/**", "node_modules/**", ".next/**", "components/ui/**", "hooks/use-toast.ts", "tailwind.config.ts"] },
  { languageOptions: { globals: globals.browser } },
  ...tseslint.configs.recommended,
  {
    ...pluginReactConfig,
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
    },
  },
];
