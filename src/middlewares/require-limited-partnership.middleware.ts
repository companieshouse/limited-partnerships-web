import { Request, Response, NextFunction } from "express";

import { getJourneyTypes, logger } from "../utils";
import { COMPANY_NOT_LIMITED_PARTNERSHIP_URL } from "../presentation/controller/global/url";
import { IDependencies, JOURNEY_TYPE_PARAM } from "../config";
import { CompanyTypeCheckResult } from "../application/service/CompanyService";
import { pageNotFound } from "./error.middleware";

export const requireLimitedPartnership =
  (dependencies: IDependencies) => async (req: Request, res: Response, next: NextFunction) => {

    const { tokens, ids } = dependencies.globalController.extract(req);

    try {
      const status = await dependencies.companyService.checkCompanyType(tokens, ids.companyId);

      if (status === CompanyTypeCheckResult.NOT_FOUND) {
        logger.infoRequest(req, `Company ${ids.companyId} cannot be found, rendering page not found`);

        return pageNotFound(req, res);
      }

      if (status === CompanyTypeCheckResult.NOT_LIMITED_PARTNERSHIP) {
        logger.infoRequest(req, `Company ${ids.companyId} is not a limited partnership, redirecting to company not limited partnership page`);

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
