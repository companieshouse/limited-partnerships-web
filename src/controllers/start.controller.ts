import { NextFunction, Request, Response } from "express";
import * as config from "../config";
import * as localise from "../utils/localise";

export const get = (req: Request, res: Response, _next: NextFunction) => {

  const lang = localise.selectLang(req.query.lang);
  const locales = localise.getLocalesService();

  return res.render(config.START_TEMPLATE, {
    ...localise.getLocaleInfo(locales, lang),
    currentUrl: config.START_URL
  });
};
