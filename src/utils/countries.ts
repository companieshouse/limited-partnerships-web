/* eslint-disable @typescript-eslint/no-require-imports */
import path from "path";

const LOCALES_PATH = path.resolve(process.cwd(), "locales");
const enCountriesPath = path.join(LOCALES_PATH, "en", "countries.json");

// need to use require to lookup the file at runtime in CiDev
const enCountriesText: Record<string, any> = require(enCountriesPath);

export const setCountriesDropdown = (i18n: Record<string, any>, countryField: string) => {
  const countries: { value: string; text: string; selected: boolean }[] = [];
  const ukCountries: { value: string; text: string; selected: boolean }[] = [];
  const enCountries = enCountriesText.countries;

  const ukCountriesKeys = ["england", "scotland", "wales", "northernIreland"];

  for (const country in i18n.countries) {
    if (country === "selectOne") {
      countries.push({ value: "", text: i18n.countries[country], selected: countryField === "" });
      continue;
    }
    if (ukCountriesKeys.includes(country)) {
      ukCountries.push({ value: enCountries[country], text: i18n.countries[country], selected: countryField?.toLowerCase() === enCountries[country]?.toLowerCase() });
    } else {
      countries.push({ value: enCountries[country], text: i18n.countries[country], selected: countryField?.toLowerCase() === enCountries[country]?.toLowerCase() });
    }
  }

  const [ selectOne, ...otherCountries ] = countries;
  const sortedCountries = [ selectOne, ...ukCountries, ...otherCountries ];

  return sortedCountries;
};
