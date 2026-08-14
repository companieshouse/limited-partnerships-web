export const setCurrenciesDropdown = (i18n: Record<string, any>, currencyField: string | undefined) => {
  const currencies: { value: string; text: string; selected: boolean }[] = [];

  for (const [currency, value] of Object.entries(i18n.currencies)) {
    currencies.push({
      value: currency,
      text: value as string,
      selected: currencyField?.toLowerCase() === currency?.toLowerCase()
    });
  }

  return currencies;
};
