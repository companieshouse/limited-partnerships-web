import { NextFunction, Request, Response } from "express";

import * as config from "../config";
import { hasFeature } from "utils/feature.flag";

export const get = (_req: Request, res: Response, _next: NextFunction) => {
  // example error message using the locales json files
  const errorMessage = res.locals.i18n["startPage"]["errorStartAddressMissing"];

  if (hasFeature().FLAG_1) {
    console.log("***** FLAG_1");
  }
  if (hasFeature().FLAG_2) {
    console.log("***** FLAG_2");
  }
  return res.render(config.START_TEMPLATE, {
    errorMessage
  });
};
