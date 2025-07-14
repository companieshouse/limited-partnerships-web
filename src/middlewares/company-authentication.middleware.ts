import { Request, Response, NextFunction } from "express";
import { authMiddleware, AuthOptions } from "@companieshouse/web-security-node";

import { getLoggedInAcspNumber, logger } from "../utils";
import { APPLICATION_CACHE_KEY, APPLICATION_CACHE_KEY_PREFIX_TRANSITION, CHS_URL } from "../config/constants";

// TODO Check if this function should be defined as 'async'

export const companyAuthentication = (request: Request, response: Response, next: NextFunction) => {
  try {
    const companyNumberCache = getCompanyNumberCache(request);

    const companyNumberSesssion = request.session?.data.signin_info?.company_number;
    logger.info(`Company number from session: ${companyNumberSesssion}`);

    // TODO Check if cache and check of company number is required here. Could just make the call every time
    //      a company is confirmed (even if it happens to be the same company as currently authenticated - would
    //      run the ACSP check again but that ACSP might have been deactivated in the meantime, so more secure)

    if (companyNumberSesssion && (companyNumberSesssion === companyNumberCache || !companyNumberCache)) {
      logger.info(`Company number from session (${companyNumberSesssion}) matches cache or cache is empty.`);

      next();
      return;
    }

    // Getting the ACSP number at this point may not be needed. Code simply added to show it is possible, if
    // required (might be needed in order to show a 'stop' screen if user is not an ACSP...)

    const acspNumber = getLoggedInAcspNumber(request.session);
    console.log("\n\n***** ACSP number of logged in user is " + acspNumber + " **** \n\n");

    invokeAuthMiddleware(companyNumberCache, request, response, next);

    next();
  } catch (err) {
    next(err);
  }
};

const getCompanyNumberCache = (request: Request): string => {
  const cookies = request.signedCookies;

  let companyNumberCache = "";

  if (cookies[APPLICATION_CACHE_KEY]) {
    const str = fromBase64(cookies[APPLICATION_CACHE_KEY]);
    const cache = str ? JSON.parse(str) : {};
    companyNumberCache = cache[`${APPLICATION_CACHE_KEY_PREFIX_TRANSITION}company_number`];
  }

  return companyNumberCache;
};

const fromBase64 = (value: string): string => {
  return Buffer.from(value, "base64").toString("utf-8");
};

const invokeAuthMiddleware = (companyNumberCache: string, request: Request, response: Response, next: NextFunction) => {
  logger.info(`Invoking company authentication with (${companyNumberCache}) present in cache`);

  const authMiddlewareConfig: AuthOptions = {
    chsWebUrl: CHS_URL,
    returnUrl: request.url,
    companyNumber: companyNumberCache
  };

  console.log("\n\n***** Invoke middleware... **** \n\n");

  const result = authMiddleware(authMiddlewareConfig)(request, response, next);

  // Value of 'result' at this point is 'undefined', both when company authentication is successful and also if there
  // is a failure (e.g. ACSP is no longer active).

  // TODO How can a potential error be detected at this point and handled approriately?

  console.log("\n\n***** Done **** \n\n");
  console.log("\n\n***** result = " + JSON.stringify(result, null, 2) + " \n\n");
};

export default companyAuthentication;
