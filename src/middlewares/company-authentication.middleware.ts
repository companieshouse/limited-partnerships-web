import { Request, Response, NextFunction } from "express";
import { authMiddleware, AuthOptions } from "@companieshouse/web-security-node";

import { logger } from "../utils";
import { CHS_URL } from "../config/constants";

export const companyAuthentication = (request: Request, response: Response, next: NextFunction) => {
  try {
    const currentCompanyNumber = request.params.companyId as string;

    const companyNumberSesssion = request.session?.data.signin_info?.company_number;
    logger.info(`Company number from session: ${companyNumberSesssion}`);

    if (companyNumberSesssion && (companyNumberSesssion === currentCompanyNumber || !currentCompanyNumber)) {
      logger.info(`Company number from session (${companyNumberSesssion}) matches company number in url.`);

      return next();
    }

    invokeAuthMiddleware(currentCompanyNumber, request, response, next);
  } catch (err) {
    next(err);
  }
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
