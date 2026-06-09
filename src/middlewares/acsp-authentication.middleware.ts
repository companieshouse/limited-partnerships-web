import { NextFunction, Request, Response } from "express";
import { acspManageUsersAuthMiddleware, AuthOptions } from "@companieshouse/web-security-node";
import { CHS_URL } from "../config/constants";
import { getLoggedInAcspNumber, logger } from "../utils";

export const acspAuthentication = (req: Request, res: Response, next: NextFunction): unknown => {

  const acspRegistrationPathSegment = "/registration/";
  const acspResumePathSuffix = "/resume";
  const path: string = req.originalUrl.toLowerCase();

  if (!(path.includes(acspRegistrationPathSegment) || path.endsWith(acspResumePathSuffix) || path === "/")) {
    return next();
  }

  const acspNumber: string = getLoggedInAcspNumber(req.session!);
  logger.debugRequest(req, `ACSP authentication middleware invoked for ACSP number: ${acspNumber}`);

  const authMiddlewareConfig: AuthOptions = {
    chsWebUrl: CHS_URL,
    returnUrl: req.originalUrl,
    acspNumber
  };
  return acspManageUsersAuthMiddleware(authMiddlewareConfig)(req, res, next);
};

export default acspAuthentication;
