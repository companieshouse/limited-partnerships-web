
export const setSicCodesList = (i18n: Record<string, any>) => {
  const sicCodesList: { value: string; text: string; }[] = [];
  const condensedSicCodes = i18n.sicCodes.condensedSicCodes;

  for (const sicCode of Object.values(condensedSicCodes)) {
    sicCodesList.push({
      value: (sicCode as { sicCode: string }).sicCode,
      text: (sicCode as { sicDescription: string }).sicDescription,
    });
  }

  return sicCodesList;
};
