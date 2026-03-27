import { NextFunction, Request, Response } from "express";

import LimitedPartnershipService from "../../../application/service/LimitedPartnershipService";
import AbstractController from "../AbstractController";
import registrationsRouting from "./Routing";
import PersonWithSignificantControlService from "../../../application/service/PersonWithSignificantControlService";

class PersonWithSignificantControlRegistrationController extends AbstractController {
  constructor(
    protected readonly limitedPartnershipService: LimitedPartnershipService,
    protected readonly personWithSignificantControlService: PersonWithSignificantControlService
  ) {
    super();
  }

  getPageRouting() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        this.personWithSignificantControlService.setI18n(response.locals.i18n);

        const { tokens, pageType, ids } = super.extract(request);
        const pageRouting = super.getRouting(registrationsRouting, pageType, request);

        const limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
          tokens,
          ids.transactionId,
          ids.submissionId
        );

        let personWithSignificantControl;
        if (ids.personWithSignificantControlId) {
          personWithSignificantControl = await this.personWithSignificantControlService.getPersonWithSignificantControl(
            tokens,
            ids.transactionId,
            ids.personWithSignificantControlId
          );
        }

        response.render(
          super.templateName(pageRouting.currentUrl),
          super.makeProps(pageRouting, { limitedPartnership, personWithSignificantControl }, null)
        );
      } catch (error) {
        next(error);
      }
    };
  }

  createPersonWithSignificantControl() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        this.personWithSignificantControlService.setI18n(response.locals.i18n);

        const { ids, pageType, tokens } = super.extract(request);
        const pageRouting = super.getRouting(registrationsRouting, pageType, request);

        const result = await this.personWithSignificantControlService.createPersonWithSignificantControl(
          tokens,
          ids.transactionId,
          request.body
        );

        if (result.errors) {
          const limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
            tokens,
            ids.transactionId,
            ids.generalPartnerId
          );

          return response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(
              pageRouting,
              { limitedPartnership, personWithSignificantControl: { data: request.body } },
              result.errors
            )
          );
        }

        const newIds = {
          ...ids,
          personWithSignificantControlId: result.personWithSignificantControlId
        };

        const url = super.insertIdsInUrl(pageRouting.nextUrl, newIds);

        response.redirect(url);
      } catch (error) {
        next(error);
      }
    };
  }
}

export default PersonWithSignificantControlRegistrationController;
