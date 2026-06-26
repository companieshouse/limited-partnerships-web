
export const setSicCodesList = (i18n: Record<string, any>) => {
  const sicCodesList: { value: string; text: string; }[] = [];
  const condensedSicCodes = i18n.sicCodes.condensedSicCodes;

  for (const sicCode of Object.values(condensedSicCodes)) {
    sicCodesList.push({
      value: (sicCode as any).sicCode,
      text: (sicCode as any).sicDescription,
    });
  }

  return sicCodesList;
};

export const mapSicCodesToList = (i18n: Record<string, any>, sicCodes: { sic_code: string; sic_description: string }[]) => {
  const unsavedSicCodesList: { value: string; text: string; }[] = [];
  const condensedSicCodes = i18n.sicCodes.condensedSicCodes;

  for (const sicCode of sicCodes) {
    Object.values(condensedSicCodes);
    unsavedSicCodesList.push({
      value: sicCode.sic_code,
      text: sicCode.sic_description,
    });
  }

  return unsavedSicCodesList;
};
