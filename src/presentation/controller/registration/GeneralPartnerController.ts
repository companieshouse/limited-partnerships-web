import { NextFunction, Request, RequestHandler, Response } from "express";

import LimitedPartnershipService from "../../../application/service/LimitedPartnershipService";
import GeneralPartnerService from "../../../application/service/GeneralPartnerService";
import registrationsRouting from "./Routing";
import AbstractController from "../AbstractController";
import RegistrationPageType from "./PageType";
import { ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL, ADD_GENERAL_PARTNER_PERSON_URL } from "./url";

class GeneralPartnerController extends AbstractController {
  private limitedPartnershipService: LimitedPartnershipService;
  private generalPartnerService: GeneralPartnerService;

  constructor(limitedPartnershipService: LimitedPartnershipService, generalPartnerService: GeneralPartnerService) {
    super();
    this.limitedPartnershipService = limitedPartnershipService;
    this.generalPartnerService = generalPartnerService;
  }

  getPageRouting(): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, pageType, ids } = super.extract(request);
        const pageRouting = super.getRouting(registrationsRouting, pageType, request);

        let limitedPartnership = {};
        const generalPartner = {};

        if (ids.transactionId && ids.submissionId) {
          limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
            tokens,
            ids.transactionId,
            ids.submissionId
          );
        }

        response.render(
          super.templateName(pageRouting.currentUrl),
          super.makeProps(pageRouting, { limitedPartnership, generalPartner }, null)
        );
      } catch (error) {
        next(error);
      }
    };
  }

  generalPartnerChoice(): RequestHandler {
    return (request: Request, response: Response, next: NextFunction) => {
      try {
        const { ids } = super.extract(request);

        let url =
          request.body.parameter === "person" ? ADD_GENERAL_PARTNER_PERSON_URL : ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL;

        url = super.insertIdsInUrl(url, ids.transactionId, ids.submissionId);

        response.redirect(url);
      } catch (error) {
        next(error);
      }
    };
  }

  createGeneralPartner(): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, ids } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, RegistrationPageType);
        const pageRouting = super.getRouting(registrationsRouting, pageType, request);

        const result = await this.generalPartnerService.createGeneralPartner(tokens, ids.transactionId, request.body);

        if (result.errors) {
          response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(pageRouting, { generalPartner: { data: request.body } }, result.errors)
          );

          return;
        }

        const url = super.insertIdsInUrl(
          pageRouting.nextUrl,
          ids.transactionId,
          ids.submissionId,
          result.generalPartnerId
        );

        response.redirect(url);
      } catch (error) {
        next(error);
      }
    };
  }
}

export default GeneralPartnerController;
