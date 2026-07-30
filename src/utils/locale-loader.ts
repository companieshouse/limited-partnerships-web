import { readFileSync } from "fs";
import path from "path";

// service fails to start in CI-Dev if using relative path to locales folder,
// so this utility uses an absolute path to the locales folder to load the json files
const LOCALES_PATH = path.resolve(process.cwd(), "locales");

export const loadLocaleJson = <T>(fileName: string, locale: string = "en"): T => {
  const filePath = path.join(LOCALES_PATH, locale, fileName);
  const fileContents = readFileSync(filePath, "utf-8");
  return JSON.parse(fileContents) as T;
};
