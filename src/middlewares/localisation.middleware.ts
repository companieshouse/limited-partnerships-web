import { Request, Response, NextFunction } from "express";
import * as localise from "../utils/localise";

export const localisationMiddleware = (req: Request, res: Response, next: NextFunction) => {

  const lang = localise.selectLang(req.query.lang);
  const localesService = localise.getLocalesService();
  const localisationProps = localise.getLocalisationProperties(localesService, lang);

  // set values needed for localisation in the templates
  res.locals.languageEnabled = localisationProps.languageEnabled;
  res.locals.languages = localisationProps.languages;
  res.locals.i18n = localisationProps.i18n;
  res.locals.lang = localisationProps.lang;
  res.locals.currentUrl = req.originalUrl.split('?')[0];

  next();
};

