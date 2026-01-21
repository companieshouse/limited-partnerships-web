import { Request, Response, NextFunction } from "express";

import { getJourneyTypes, logger } from "../utils";
import { TRANSITION_ALREADY_FILED_URL } from "../presentation/controller/transition/url";
import { COMPANY_ID } from "../config/constants";

export const transitionFiling = (req: Request, res: Response, next: NextFunction) => {
  const journeyTypes = getJourneyTypes(req.originalUrl);

  if (journeyTypes.isTransition) {
    // temporary logic to simulate existing filing check - will be replace by a call to filing service
    const filingExists = req.query["formExists"];

    if (filingExists === "true") {
      logger.infoRequest(req, "Filing already exists, redirecting to already filed page");

      const companyId = req.params.companyId;

      const redirectUrl = insertCompanyId(TRANSITION_ALREADY_FILED_URL, companyId);

      return res.redirect(redirectUrl);
    }
  }

  return next();
};

const insertCompanyId = (url: string, companyId: string): string => {
  return companyId ? url.replace(`:${COMPANY_ID}`, companyId) : url;
};
