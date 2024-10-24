import typescriptEslint from "@typescript-eslint/eslint-plugin";
import stylisticTs from '@stylistic/eslint-plugin-ts'
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [...compat.extends(
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
), {
    plugins: {
        "@typescript-eslint": typescriptEslint,
        '@stylistic/ts': stylisticTs
    },

    languageOptions: {
        globals: {
            ...globals.node,
            ...globals.jest,
        },

        parser: tsParser,
        ecmaVersion: "latest",
        sourceType: "commonjs",
    },

    rules: {
        "@typescript-eslint/ban-types": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-inferrable-types": "off",

        "@typescript-eslint/no-unused-vars": ["error", {
            argsIgnorePattern: "^_",
        }],

        "semi": ["error", "always"],
        "@stylistic/ts/type-annotation-spacing": "error",
        "arrow-spacing": "error",

        "brace-style": ["error", "1tbs", {
            allowSingleLine: true,
        }],

        "comma-spacing": ["error", {
            before: false,
            after: true,
        }],

        curly: "error",
        eqeqeq: "error",
        "eol-last": ["warn", "always"],

        indent: ["error", 2, {
            FunctionExpression: {
                parameters: "first",
            },

            CallExpression: {
                arguments: "first",
            },

            outerIIFEBody: 2,
            SwitchCase: 2,
        }],

        "key-spacing": ["error", {
            afterColon: true,
        }],

        "keyword-spacing": ["error", {
            before: true,
            after: true,
        }],

        "no-duplicate-imports": "error",
        "no-irregular-whitespace": "error",
        "no-trailing-spaces": "error",
        "no-multi-spaces": "error",

        "no-multiple-empty-lines": ["error", {
            max: 1,
            maxEOF: 1,
        }],

        "no-underscore-dangle": ["error", {
            allowFunctionParams: true,
        }],

        "no-unused-vars": "off",
        "no-whitespace-before-property": "error",
        "object-curly-spacing": ["error", "always"],
        "require-await": "error",
        "space-infix-ops": "error",

        "spaced-comment": ["error", "always", {
            markers: ["/", "*"],
        }],
    },
}];