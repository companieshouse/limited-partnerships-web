import { SicCode } from "../domain/validator/SicCodes";

export const setSicCodesList = (i18n: Record<string, any>) => {
  const sicCodesList: SicCode[] = [];
  const condensedSicCodes = i18n.sicCodes.condensedSicCodes;

  for (const [sicCodeKey, sicCodeValue] of Object.entries(condensedSicCodes)) {
    sicCodesList.push({
      code: sicCodeKey,
      description: sicCodeValue as string
    });
  }

  return sicCodesList;
};
