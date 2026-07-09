import { Request, Response, NextFunction } from "express";
import {
  getLocalesService,
  getLocalisationProperties,
  selectLang,
} from "../utils";

export const localisationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // An explicit, valid `lang` query param always wins so a user can switch
  // language mid-journey. Otherwise fall back to the language persisted on the
  // session, so a page re-entered without a lang param - e.g. the payment
  // success/failure/confirmation screens after resuming a Welsh payment - still
  // renders in the language the journey was started in (LP-1529).
  const langSource =
    req.query.lang === "en" || req.query.lang === "cy"
      ? req.query.lang
      : req.session?.getLanguage?.();
  const lang = selectLang(langSource);
  const localesService = getLocalesService();
  const localisationProps = getLocalisationProperties(localesService, lang);

  // set values needed for localisation in the templates
  res.locals.languageEnabled = localisationProps.languageEnabled;
  res.locals.languages = localisationProps.languages;
  res.locals.i18n = localisationProps.i18n;
  res.locals.lang = localisationProps.lang;
  res.locals.currentUrl = req.originalUrl.split("?")[0];

  next();
};
