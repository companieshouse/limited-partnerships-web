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
  const lang = selectLang(req.query.lang);
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
