import { Request, Response, NextFunction } from "express";
import { authMiddleware, AuthOptions } from "@companieshouse/web-security-node";

import { logger } from "../utils";
import { APPLICATION_CACHE_KEY, APPLICATION_CACHE_KEY_COMPANY_NUMBER, CHS_URL } from "../config/constants";

export const companyAuthentication = (request: Request, response: Response, next: NextFunction) => {
  try {
    const companyNumberCache = getCompanyNumberCache(request);

    const companyNumberSesssion = request.session?.data.signin_info?.company_number;
    logger.info(`Company number from session: ${companyNumberSesssion}`);

    if (companyNumberSesssion && (companyNumberSesssion === companyNumberCache || !companyNumberCache)) {
      logger.info(`Company number from session (${companyNumberSesssion}) matches cache or cache is empty.`);

      return next();
    }

    invokeAuthMiddleware(companyNumberCache, request, response, next);
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
    companyNumberCache = cache[APPLICATION_CACHE_KEY_COMPANY_NUMBER];
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

  authMiddleware(authMiddlewareConfig)(request, response, next);
};

export default companyAuthentication;
