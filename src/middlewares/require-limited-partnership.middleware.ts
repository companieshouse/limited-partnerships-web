import { Request, Response, NextFunction } from "express";

import { getJourneyTypes, logger } from "../utils";
import { COMPANY_NOT_LIMITED_PARTNERSHIP_URL } from "../presentation/controller/global/url";
import { IDependencies, JOURNEY_TYPE_PARAM } from "../config";

export const requireLimitedPartnership =
  (dependencies: IDependencies) => async (req: Request, res: Response, next: NextFunction) => {

    const { tokens, ids } = dependencies.globalController.extract(req);

    try {
      const isNotLimitedPartnership = await dependencies.companyService.isNotLimitedPartnership(
        tokens,
        ids.companyId
      );

      if (isNotLimitedPartnership) {
        logger.infoRequest(req, "Company is not a limited partnership, redirecting to company not limited partnership page");

        let redirectUrl = dependencies.globalController
          .insertCompanyId(COMPANY_NOT_LIMITED_PARTNERSHIP_URL, ids.companyId)
          .replace(JOURNEY_TYPE_PARAM, getJourneyTypes(req.originalUrl).journey);

        const queryIndex = req.originalUrl.indexOf("?");
        if (queryIndex !== -1) {
          redirectUrl += req.originalUrl.slice(queryIndex);
        }

        return res.redirect(redirectUrl);
      }
    } catch (error) {
      return next(error);
    }

    return next();
  };
