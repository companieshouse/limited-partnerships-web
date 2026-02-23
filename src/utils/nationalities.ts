type DropdownItem = {
  value: string;
  text: string;
  selected?: boolean;
};

const UK_NATIONALITY_KEYS = ["british", "english", "northernIrish", "scottish", "welsh"];

const setNationalitiesDropdown = (
  i18n: Record<string, any>,
  nationalityField: string | undefined,
  selectPrompt: string
): DropdownItem[] => {
  const nationalities = i18n.nationalities ?? {};
  const fieldLower = nationalityField?.toLowerCase();

  const buildItem = (key: string): DropdownItem => {
    const text = nationalities[key];
    return {
      value: text,
      text,
      selected: fieldLower === text?.toLowerCase()
    };
  };

  const ukItems = UK_NATIONALITY_KEYS
    .filter((key) => nationalities[key])
    .map(buildItem);

  const remainingItems = Object.keys(nationalities)
    .filter((key) => !UK_NATIONALITY_KEYS.includes(key))
    .map(buildItem);

  return [
    { value: "", text: selectPrompt },
    ...ukItems,
    ...remainingItems
  ];
};

export default setNationalitiesDropdown;
