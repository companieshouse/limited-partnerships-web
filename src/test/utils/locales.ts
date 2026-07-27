import enAddress from "../../../locales/en/address.json";
import enCountries from "../../../locales/en/countries.json";
import enErrors from "../../../locales/en/errors.json";
import enNationalities from "../../../locales/en/nationalities.json";
import enPsc from "../../../locales/en/personWithSignificantControl.json";
import enSicCodes from "../../../locales/en/sicCodes.json";
import enRootTranslations from "../../../locales/en/translations.json";
import cyAddress from "../../../locales/cy/address.json";
import cyCountries from "../../../locales/cy/countries.json";
import cyErrors from "../../../locales/cy/errors.json";
import cyNationalities from "../../../locales/cy/nationalities.json";
import cyPsc from "../../../locales/cy/personWithSignificantControl.json";
import cySicCodes from "../../../locales/cy/sicCodes.json";
import cyRootTranslations from "../../../locales/cy/translations.json";

export const enTranslationText = {
  ...enRootTranslations,
  ...enAddress,
  ...enCountries,
  ...enErrors,
  ...enNationalities,
  ...enPsc,
  ...enSicCodes
};

export const cyTranslationText = {
  ...cyRootTranslations,
  ...cyAddress,
  ...cyCountries,
  ...cyErrors,
  ...cyNationalities,
  ...cyPsc,
  ...cySicCodes
};

