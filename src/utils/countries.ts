export const setCountriesDropdown = (i18n: Record<string, any>, countryField: string) => {
  const countries: { value: string; text: string; selected: boolean }[] = [];
  const ukCountries: { value: string; text: string; selected: boolean }[] = [];

  const ukCountriesKeys = ["england", "scotland", "wales", "northernIreland"];

  for (const country in i18n.countries) {
    if (ukCountriesKeys.includes(country)) {
      ukCountries.push({ value: i18n.countries[country], text: i18n.countries[country], selected: countryField?.toLowerCase() === i18n.countries[country]?.toLowerCase() });
    }
    countries.push({ value: i18n.countries[country], text: i18n.countries[country], selected: countryField?.toLowerCase() === i18n.countries[country]?.toLowerCase() });
  }

  const [ selectOne, ...otherCountries ] = countries;
  const sortedCountries = [ selectOne, ...ukCountries, ...otherCountries ];

  return sortedCountries;
};
