import { LocalesService, LanguageNames } from "@companieshouse/ch-node-utils";
import { LOCALES_ENABLED, LOCALES_PATH } from "../config";

type Language = "cy" | "en"; // Add more languages as needed

const languageMap: { [key in Language]?: string } = {
  cy: "cy",
  en: "en",
  // Add more languages here
};

export const selectLang = (lang: any): string => {
  return languageMap[lang as Language] || "en";
};

export const addLangToUrl = (url: string, lang?: string): string => {
  if (!lang) {
    return url;
  }
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}lang=${lang}`;
};

export const getLocaleInfo = (locales: LocalesService, lang: string) => {
  return {
    languageEnabled: locales.enabled,
    languages: LanguageNames.sourceLocales(locales.localesFolder),
    i18n: locales.i18nCh.resolveNamespacesKeys(lang),
    lang
  };
};

const localesSevice = LocalesService.getInstance(LOCALES_PATH, LOCALES_ENABLED === "true");

export const getLocalesService = () => localesSevice;
