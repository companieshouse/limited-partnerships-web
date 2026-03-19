import { NextFunction, Request, Response } from "express";

import LimitedPartnershipService from "../../../application/service/LimitedPartnershipService";
import AbstractController from "../AbstractController";
import registrationsRouting from "./Routing";
import PscService from "../../../application/service/PscService";

class PscRegistrationController extends AbstractController {
  constructor(
    protected readonly limitedPartnershipService: LimitedPartnershipService,
    protected readonly pscService: PscService
  ) {
    super();
  }

  getPageRouting() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        this.pscService.setI18n(response.locals.i18n);

        const { tokens, pageType, ids } = super.extract(request);
        const pageRouting = super.getRouting(registrationsRouting, pageType, request);

        const limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
          tokens,
          ids.transactionId,
          ids.submissionId
        );

        response.render(
          super.templateName(pageRouting.currentUrl),
          super.makeProps(pageRouting, { limitedPartnership }, null)
        );
      } catch (error) {
        next(error);
      }
    };
  }
}

export default PscRegistrationController;
