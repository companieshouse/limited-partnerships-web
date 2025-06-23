import { NextFunction, Request, Response } from "express";

import transitionRouting from "./Routing";
import AbstractController from "../AbstractController";
import RegistrationPageType from "./PageType";
import { ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL, ADD_GENERAL_PARTNER_PERSON_URL } from "./url";

import LimitedPartnershipService from "../../../application/service/LimitedPartnershipService";
import GeneralPartnerService from "../../../application/service/GeneralPartnerService";
import LimitedPartnerService from "../../../application/service/LimitedPartnerService";

class GeneralPartnerController extends AbstractController {
  constructor(
    private readonly limitedPartnershipService: LimitedPartnershipService,
    private readonly generalPartnerService: GeneralPartnerService,
    private readonly limitedPartnerService: LimitedPartnerService
  ) {
    super();
  }

  getPageRouting() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        this.generalPartnerService.setI18n(response.locals.i18n);

        const { tokens, pageType, ids } = super.extract(request);
        const pageRouting = super.getRouting(transitionRouting, pageType, request);

        // Set the previous URL conditionally based on review page or general partner list

        let limitedPartnership = {};
        let generalPartner = {};

        if (ids.transactionId && ids.submissionId) {
          limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
            tokens,
            ids.transactionId,
            ids.submissionId
          );
        }

        if (ids.transactionId && ids.generalPartnerId) {
          generalPartner = await this.generalPartnerService.getGeneralPartner(
            tokens,
            ids.transactionId,
            ids.generalPartnerId
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

  generalPartnerChoice() {
    return (request: Request, response: Response, next: NextFunction) => {
      try {
        const { ids } = super.extract(request);

        let url =
          request.body.parameter === "person" ? ADD_GENERAL_PARTNER_PERSON_URL : ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL;

        url = super.insertIdsInUrl(url, ids, request.url);

        response.redirect(url);
      } catch (error) {
        next(error);
      }
    };
  }

  createGeneralPartner() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, ids } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, RegistrationPageType);
        const pageRouting = super.getRouting(transitionRouting, pageType, request);

        const result = await this.generalPartnerService.createGeneralPartner(tokens, ids.transactionId, request.body);

        if (result.errors) {
          response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(pageRouting, { generalPartner: { data: request.body } }, result.errors)
          );

          return;
        }
        const newIds = { ...ids, generalPartnerId: result.generalPartnerId };

        const url = super.insertIdsInUrl(pageRouting.nextUrl, newIds);

        response.redirect(url);
      } catch (error) {
        next(error);
      }
    };
  }

  sendPageData() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, ids } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, RegistrationPageType);
        const pageRouting = super.getRouting(transitionRouting, pageType, request);

        const result = await this.generalPartnerService.sendPageData(
          tokens,
          ids.transactionId,
          ids.generalPartnerId,
          request.body
        );

        if (result?.errors) {
          response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(pageRouting, { generalPartner: { data: request.body } }, result.errors)
          );
          return;
        }

        response.redirect(pageRouting.nextUrl);
      } catch (error) {
        next(error);
      }
    };
  }
}

export default GeneralPartnerController;
