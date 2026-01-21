import { Request, Response, NextFunction } from "express";

import { getJourneyTypes, logger } from "../utils";
import { TRANSITION_ALREADY_FILED_URL } from "../presentation/controller/transition/url";
import { IDependencies } from "../config";

export const transitionFiling =
  (dependencies: IDependencies) => async (req: Request, res: Response, next: NextFunction) => {
    const journeyTypes = getJourneyTypes(req.originalUrl);

    if (journeyTypes.isTransition) {
      const tokens = dependencies.globalController.extractTokens(req);
      const companyId = req.params.companyId;

      try {
        const filingHistoryItems = await dependencies.filingHistoryService.getFilingHistoryList(tokens, companyId);

        const formTypes = ["LPTS01", "LP5D", "LP7D"];
        const types = filingHistoryItems.map((item) => item.type);

        const hasFiledForm = formTypes.some((formType) => types.includes(formType));

        if (hasFiledForm) {
          logger.infoRequest(req, "Filing already exists, redirecting to already filed page");

          const redirectUrl = dependencies.globalController.insertCompanyId(TRANSITION_ALREADY_FILED_URL, companyId);

          return res.redirect(redirectUrl);
        }
      } catch (error) {
        return next(error);
      }
    }

    return next();
  };
