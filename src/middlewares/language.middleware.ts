import { Request, Response, NextFunction } from "express";
import { selectLang } from "../utils";

/**
 * Persists the selected language on the session whenever a request carries a
 * `lang` query param.
 *
 * A request's language normally travels in the `lang` query param, but that is
 * lost when the app is re-entered from an external page - e.g. resuming a
 * pending payment from the "Your filings" page, whose resume link carries no
 * `lang`. Storing the choice on the session lets `localisationMiddleware` fall
 * back to it, so the payment success/failure/confirmation screens stay in Welsh
 * when the journey was completed in Welsh (LP-1529).
 *
 * Must be registered after SessionMiddleware so that `req.session` is available.
 */
export const languageMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.session && req.query.lang) {
    req.session.setLanguage(selectLang(req.query.lang));
  }

  next();
};
