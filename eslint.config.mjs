import { readdirSync } from "node:fs";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Every folder under features/ is a module, so a new one is covered as soon as it exists.
const featureModules = readdirSync(new URL("./features", import.meta.url), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

// Matches an import of features/<name>, through the "@/" alias or a relative path.
function importsFeature(names) {
  return `^(@/features/|(\\.\\./)+(features/)?)(${names.join("|")})(/|$)`;
}

// Modules are self-contained: one never imports from another, and core/ never
// imports from a module. What two modules need goes in core/.
const moduleBoundaries = [
  ...featureModules.map((name) => ({
    files: [`features/${name}/**`],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: importsFeature(featureModules.filter((other) => other !== name)),
              message: "A module under features/ cannot import from another one. Move shared code to core/.",
            },
          ],
        },
      ],
    },
  })),
  {
    files: ["core/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: importsFeature(featureModules),
              message: "core/ cannot import from features/. Modules depend on core/, not the other way around.",
            },
          ],
        },
      ],
    },
  },
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...moduleBoundaries,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
