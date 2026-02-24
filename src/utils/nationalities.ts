export const setNationalitiesDropdown = (i18n: Record<string, any>, nationalityField: string | undefined, selectPrompt: string) => {
  const nationalities: { value: string; text: string; selected: boolean }[] = [];
  const ukNationalities: { value: string; text: string; selected: boolean }[] = [];

  const ukNationalitiesKeys = ["british", "english", "northernIrish", "scottish", "welsh"];

  for (const nationality in i18n.nationalities) {
    if (ukNationalitiesKeys.includes(nationality)) {
      ukNationalities.push({ value: i18n.nationalities[nationality], text: i18n.nationalities[nationality], selected: nationalityField?.toLowerCase() === i18n.nationalities[nationality]?.toLowerCase() });
    } else {
      nationalities.push({ value: i18n.nationalities[nationality], text: i18n.nationalities[nationality], selected: nationalityField?.toLowerCase() === i18n.nationalities[nationality]?.toLowerCase() });
    }
  }

  const sortedNationalities = [{ value: "", text: selectPrompt, selected: false }, ...ukNationalities, ...nationalities];

  return sortedNationalities;
};
