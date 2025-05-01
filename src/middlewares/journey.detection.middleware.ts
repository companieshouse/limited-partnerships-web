/**
 * Middleware to check and set the journey type (which can then be used by page templates to set the banner, etc..)
 */
import { NextFunction, Request, Response } from "express";
import { getJourneyTypes, logger } from "../utils";

export const journeyDetectionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  res.locals.journeyTypes = getJourneyTypes(req.baseUrl);

  logger.debugRequest(req, "Setting journey types in res.locals.journeyTypes " + JSON.stringify(res.locals.journeyTypes));

  return next();
};
