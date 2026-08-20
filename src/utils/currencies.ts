export const setCurrenciesDropdown = (i18n: Record<string, any>, currencyField: string | undefined) => {
  const currencies: { code: string; text: string; selected: boolean }[] = [];

  for (const [code, text] of Object.entries(i18n.currencies)) {
    currencies.push({
      code,
      text: text as string,
      selected: currencyField?.toLowerCase() === code?.toLowerCase()
    });
  }

  return currencies;
};
