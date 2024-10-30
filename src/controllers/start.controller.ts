import { NextFunction, Request, Response } from "express";

import * as config from "../config";

export const get = (_req: Request, res: Response, _next: NextFunction) => {
  // example error message using the locales json files
  const errorMessage = res.locals.i18n["errorStartAddressMissing"];

  return res.render(config.START_TEMPLATE, {
    errorMessage
  });
};
