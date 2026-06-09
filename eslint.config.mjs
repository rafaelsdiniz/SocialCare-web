import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Os efeitos do projeto usam setState de forma intencional: detecção de
      // mount para portais, sincronização com a rota, flags de carregamento
      // antes de fetch, reset de animação e hidratação a partir de dados
      // assíncronos. São usos válidos, não o anti-padrão de render em cascata.
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
