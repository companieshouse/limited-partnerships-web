import { NextFunction, Request, Response } from "express";
import { CsrfError } from "@companieshouse/web-security-node";

import { logger } from "../utils";
import * as config from "../config/constants";
import { WHICH_TYPE_URL } from "presentation/controller/registration/url";

const pageNotFound = (req: Request, res: Response) => {
  return res.status(404).render(config.NOT_FOUND_TEMPLATE, {
    templateName: config.NOT_FOUND_TEMPLATE,
  });
};

/**
 * This handler catches any CSRF errors thrown within the application.
 * If it is not a CSRF, the error is passed to the next error handler.
 * If it is a CSRF error, it responds with a 403 forbidden status and renders the CSRF error.
 */
const csrfErrorHandler = (
  err: CsrfError | Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Handle non-CSRF Errors immediately
  if (!(err instanceof CsrfError)) {
    return next(err);
  }

  return res.status(403).render(config.ERROR_TEMPLATE, {
    templateName: config.ERROR_TEMPLATE,
    csrfErrors: true,
  });
};

/**
 * This handler catches any other error thrown within the application.
 * Use this error handler by calling next(e) from within a controller
 * Always keep this as the last handler in the chain for it to work.
 */
const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.errorRequest(
    req,
    `An error has occurred. Re-routing to the error screen - ${err.stack}`
  );

  const previous = req.get("Referrer") ?? WHICH_TYPE_URL;
  res.status(500).render(config.ERROR_TEMPLATE, {
    templateName: config.ERROR_TEMPLATE,
    props: {
      previousUrl: previous
    }
  });
};

const errorHandler = [pageNotFound, csrfErrorHandler, globalErrorHandler];

export { errorHandler };
