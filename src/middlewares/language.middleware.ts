import { Request, Response, NextFunction } from "express";
import { selectLang } from "../utils";

/**
 * Persists the selected language on the session whenever a request carries a
 * `lang` query param.
 *
 * The `lang` query param is the only source of language for a request
 * (see localisationMiddleware), and it is lost when the app is re-entered from
 * an external page - e.g. resuming a pending payment from the "Your filings"
 * page, whose resume link carries no `lang`. Storing the choice on the session
 * lets those flows recover it so the payment success/failure screens stay in
 * Welsh when the journey was completed in Welsh (LP-1529).
 *
 * Must be registered after SessionMiddleware so that `req.session` is available.
 */
export const languageMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.session && req.query.lang) {
    req.session.setLanguage(selectLang(req.query.lang));
  }

  next();
};
