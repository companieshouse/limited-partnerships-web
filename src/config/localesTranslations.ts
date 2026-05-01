/* eslint-disable @typescript-eslint/no-require-imports */
import path from "path";

const LOCALES_PATH = path.resolve(process.cwd(), "locales");
const enTranslationPath = path.join(LOCALES_PATH, "en", "translations.json");
const cyTranslationPath = path.join(LOCALES_PATH, "cy", "translations.json");

export const enTranslation: Record<string, any> = require(enTranslationPath);
export const cyTranslation: Record<string, any> = require(cyTranslationPath);
