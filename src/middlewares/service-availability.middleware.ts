import { NextFunction, Request, Response } from "express";
import {
  SERVICE_UNAVAILABLE_TEMPLATE,
  SHOW_SERVICE_UNAVAILABLE_PAGE,
} from "../config";
import { logger } from "../utils/logger";
import GlobalPageType from "../presentation/controller/global/PageType";

/**
 * Shows service offline page if config flag SHOW_SERVICE_UNAVAILABLE_PAGE=true
 */
export const serviceAvailabilityMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const baseUrl = req.url.split('?')[0];

  // Allow health check to proceed regardless of the service offline flag
  if (baseUrl.endsWith(`/${GlobalPageType.healthcheck}`)) {
    return next();
  }

  if (SHOW_SERVICE_UNAVAILABLE_PAGE) {
    logger.infoRequest(req, "Service offline flag is set - displaying service offline page");
    return res.render(SERVICE_UNAVAILABLE_TEMPLATE);
  }

  // flag SHOW_SERVICE_UNAVAILABLE_PAGE is false - carry on as normal
  return next();
};
