/* eslint-disable @typescript-eslint/no-require-imports */
import path from "path";

const LOCALES_PATH = path.resolve(process.cwd(), "locales");
const enNationalitiesPath = path.join(LOCALES_PATH, "en", "nationalities.json");

// need to use require to lookup the file at runtime in CiDev
const enNationalitiesText: Record<string, any> = require(enNationalitiesPath);

export const setNationalitiesDropdown = (i18n: Record<string, any>, nationalityField: string | undefined, selectPrompt: string) => {
  const nationalities: { value: string; text: string; selected: boolean }[] = [];
  const ukNationalities: { value: string; text: string; selected: boolean }[] = [];
  const enNationalities = enNationalitiesText.nationalities;

  const ukNationalitiesKeys = ["british", "english", "northernIrish", "scottish", "welsh"];

  for (const nationality in i18n.nationalities) {
    if (ukNationalitiesKeys.includes(nationality)) {
      ukNationalities.push({ value: enNationalities[nationality], text: i18n.nationalities[nationality], selected: nationalityField?.toLowerCase() === enNationalities[nationality]?.toLowerCase() });
    } else {
      nationalities.push({ value: enNationalities[nationality], text: i18n.nationalities[nationality], selected: nationalityField?.toLowerCase() === enNationalities[nationality]?.toLowerCase() });
    }
  }

  const sortedNationalities = [{ value: "", text: selectPrompt, selected: false }, ...ukNationalities, ...nationalities];

  return sortedNationalities;
};
