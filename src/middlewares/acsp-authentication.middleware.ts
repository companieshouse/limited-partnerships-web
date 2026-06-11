import { NextFunction, Request, Response } from "express";
import { acspManageUsersAuthMiddleware, AuthOptions } from "@companieshouse/web-security-node";
import { CHS_URL } from "../config/constants";
import { NOT_ELIGIBLE_URL, SIGN_OUT_URL } from "../presentation/controller/global/url";
import { getLoggedInAcspNumber, logger } from "../utils";

// Every route is gated so that only valid ACSP users can use the service, except these:
//  - the not-eligible stop page, where non-ACSP users are sent (it must render, otherwise the ACSP
//    check would loop on its own error page);
//  - sign-out, which must always be available so a user can leave the service.
// Healthcheck is already excluded where this middleware is mounted (config.allPathsExceptHealthcheck).
const acspExemptPaths = [NOT_ELIGIBLE_URL.toLowerCase(), SIGN_OUT_URL.toLowerCase()];

export const acspAuthentication = (req: Request, res: Response, next: NextFunction): unknown => {

  // Drop any query string / fragment so the comparison below matches the path exactly.
  const path: string = req.originalUrl.toLowerCase().split(/[?#]/)[0];

  if (acspExemptPaths.includes(path)) {
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
