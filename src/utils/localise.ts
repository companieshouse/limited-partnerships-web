import { LocalesService, LanguageNames } from "@companieshouse/ch-node-utils";
import { isLocalesEnabled, LOCALES_PATH } from "../config/constants";

enum Language {
  CY = "cy",
  EN = "en",
}

export const selectLang = (lang: any): string => {
  if (!isLocalesEnabled()) {
    return Language.EN;
  }
  return Object.values(Language).includes(lang) ? lang : Language.EN;
};

export const addLangToUrl = (url: string, lang?: string): string => {
  if (!lang) {
    return url;
  }
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}lang=${lang}`;
};

export const getLocalisationProperties = (
  locales: LocalesService,
  lang: string
) => {
  return {
    languageEnabled: locales.enabled,
    languages: LanguageNames.sourceLocales(locales.localesFolder),
    i18n: locales.i18nCh.resolveNamespacesKeys(lang),
    lang,
  };
};

const localesSevice = LocalesService.getInstance(
  LOCALES_PATH,
  isLocalesEnabled()
);

export const getLocalesService = () => localesSevice;
