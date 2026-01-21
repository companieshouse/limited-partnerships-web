import { Request, Response, NextFunction } from "express";

import { getJourneyTypes, logger } from "../utils";
import { TRANSITION_ALREADY_FILED_URL } from "../presentation/controller/transition/url";
import { COMPANY_ID } from "../config/constants";
import FilingHistoryService from "../application/service/FilingHistoryService";
import { Tokens } from "../domain/types";

export const transitionFiling =
  (filingHistoryService: FilingHistoryService) => async (req: Request, res: Response, next: NextFunction) => {
    const journeyTypes = getJourneyTypes(req.originalUrl);

    if (journeyTypes.isTransition) {
      const tokens = extractTokens(req);
      const companyId = req.params.companyId;

      try {
        const filingHistoryItems = await filingHistoryService.getFilingHistoryList(tokens, companyId);

        const formTypes = ["LPTS01", "LP5D", "LP7D"];
        const types = filingHistoryItems.map((item) => item.type);

        const hasFiledForm = formTypes.some((formType) => types.includes(formType));

        if (hasFiledForm) {
          logger.infoRequest(req, "Filing already exists, redirecting to already filed page");

          const redirectUrl = insertCompanyId(TRANSITION_ALREADY_FILED_URL, companyId);

          return res.redirect(redirectUrl);
        }
      } catch (error) {
        return next(error);
      }
    }

    return next();
  };

const insertCompanyId = (url: string, companyId: string): string => {
  return companyId ? url.replace(`:${COMPANY_ID}`, companyId) : url;
};

const extractTokens = (request: Request): Tokens => {
  return {
    access_token: request?.session?.data?.signin_info?.access_token?.access_token ?? "",
    refresh_token: request?.session?.data?.signin_info?.access_token?.refresh_token ?? ""
  };
};
