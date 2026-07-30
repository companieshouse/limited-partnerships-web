import { loadLocaleJson } from "./locale-loader";

const enCountriesText = loadLocaleJson<{ countries: Record<string, string> }>("countries.json");

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
