import { NextFunction, Request, RequestHandler, Response } from "express";

import LimitedPartnershipService from "../../../application/service/LimitedPartnershipService";
import LimitedPartnerService from "../../../application/service/LimitedPartnerService";
import registrationsRouting from "./Routing";
import AbstractController from "../AbstractController";
import RegistrationPageType from "./PageType";
import {
  ADD_LIMITED_PARTNER_PERSON_URL,
  ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL
} from "./url";

class LimitedPartnerController extends AbstractController {
  private limitedPartnershipService: LimitedPartnershipService;
  private limitedPartnerService: LimitedPartnerService;

  constructor(limitedPartnershipService: LimitedPartnershipService, limitedPartnerService: LimitedPartnerService) {
    super();
    this.limitedPartnershipService = limitedPartnershipService;
    this.limitedPartnerService = limitedPartnerService;
  }

  getPageRouting(): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, pageType, ids } = super.extract(request);
        const pageRouting = super.getRouting(registrationsRouting, pageType, request);

        let limitedPartnership = {};
        let limitedPartner = {};

        if (ids.transactionId && ids.submissionId) {
          limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
            tokens,
            ids.transactionId,
            ids.submissionId
          );
        }

        if (ids.transactionId && ids.limitedPartnerId) {
          limitedPartner = await this.limitedPartnerService.getLimitedPartner(
            tokens,
            ids.transactionId,
            ids.limitedPartnerId
          );
        }

        response.render(
          super.templateName(pageRouting.currentUrl),
          super.makeProps(pageRouting, { limitedPartnership, limitedPartner }, null)
        );
      } catch (error) {
        next(error);
      }
    };
  }

  limitedPartnerChoice(): RequestHandler {
    return (request: Request, response: Response, next: NextFunction) => {
      try {
        const { ids } = super.extract(request);

        let url =
          request.body.parameter === "person" ? ADD_LIMITED_PARTNER_PERSON_URL : ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL;

        url = super.insertIdsInUrl(url, ids.transactionId, ids.submissionId);

        response.redirect(url);
      } catch (error) {
        next(error);
      }
    };
  }

  createLimitedPartner(): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, ids } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, RegistrationPageType);
        const pageRouting = super.getRouting(registrationsRouting, pageType, request);

        const result = await this.limitedPartnerService.createLimitedPartner(tokens, ids.transactionId, request.body);

        if (result.errors) {
          response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(pageRouting, { limitedPartner: { data: request.body } }, result.errors)
          );

          return;
        }

        const url = super.insertIdsInUrl(
          pageRouting.nextUrl,
          ids.transactionId,
          ids.submissionId,
          result.limitedPartnerId
        );

        response.redirect(url);
      } catch (error) {
        next(error);
      }
    };
  }

  sendPageData(): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, ids } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, RegistrationPageType);
        const pageRouting = super.getRouting(registrationsRouting, pageType, request);

        const result = await this.limitedPartnerService.sendPageData(
          tokens,
          ids.transactionId,
          ids.limitedPartnerId,
          request.body
        );

        if (result?.errors) {
          response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(pageRouting, { limitedPartner: { data: request.body } }, result.errors)
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

export default LimitedPartnerController;
