import { readFileSync } from "fs";
import path from "path";

const LOCALES_PATH = path.resolve(process.cwd(), "locales");

export const loadLocaleJson = <T>(fileName: string): T => {
  const filePath = path.join(LOCALES_PATH, "en", fileName);
  const fileContents = readFileSync(filePath, "utf-8");
  return JSON.parse(fileContents) as T;
};