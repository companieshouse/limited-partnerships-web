import enTranslation from "../../locales/en/translations.json";

export const setNationalitiesDropdown = (i18n: Record<string, any>, nationalityField: string | undefined, selectPrompt: string) => {
  const nationalities: { value: string; text: string; selected: boolean }[] = [];
  const ukNationalities: { value: string; text: string; selected: boolean }[] = [];

  const ukNationalitiesKeys = ["british", "english", "northernIrish", "scottish", "welsh"];

  for (const nationality in i18n.nationalities) {
    if (ukNationalitiesKeys.includes(nationality)) {
      ukNationalities.push({ value: enTranslation.nationalities[nationality], text: i18n.nationalities[nationality], selected: nationalityField?.toLowerCase() === enTranslation.nationalities[nationality]?.toLowerCase() });
    } else {
      nationalities.push({ value: enTranslation.nationalities[nationality], text: i18n.nationalities[nationality], selected: nationalityField?.toLowerCase() === enTranslation.nationalities[nationality]?.toLowerCase() });
    }
  }

  const sortedNationalities = [{ value: "", text: selectPrompt, selected: false }, ...ukNationalities, ...nationalities];

  return sortedNationalities;
};
