import { NextFunction, Request, RequestHandler, Response } from "express";

import LimitedPartnershipService from "../../../application/service/LimitedPartnershipService";
import GeneralPartnerService from "../../../application/service/GeneralPartnerService";
import registrationsRouting from "./Routing";
import AbstractController from "../AbstractController";
import RegistrationPageType from "./PageType";
import { ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL, ADD_GENERAL_PARTNER_PERSON_URL, LIMITED_PARTNERS_URL } from "./url";
import { GeneralPartner } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

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

  getReviewPage(): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, pageType, ids } = super.extract(request);
        const pageRouting = super.getRouting(registrationsRouting, pageType, request);

        let limitedPartnership = {};
        let generalPartners: GeneralPartner[] = [];

        if (ids.transactionId && ids.submissionId) {
          limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
            tokens,
            ids.transactionId,
            ids.submissionId
          );

          generalPartners = await this.generalPartnerService.getGeneralPartners(tokens, ids.transactionId);
        }

        response.render(
          super.templateName(pageRouting.currentUrl),
          super.makeProps(pageRouting, { limitedPartnership, generalPartners }, null)
        );
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

  sendPageData(): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, ids } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, RegistrationPageType);
        const pageRouting = super.getRouting(registrationsRouting, pageType, request);

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

  postReviewPage(): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { ids, tokens } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, RegistrationPageType);
        const pageRouting = super.getRouting(registrationsRouting, pageType, request);

        const addAnotherGeneralPartner = request.body.addAnotherGeneralPartner;

        if (addAnotherGeneralPartner === "no") {
          const generalPartners = await this.generalPartnerService.getGeneralPartners(tokens, ids.transactionId);

          if (generalPartners.length === 0) {
            const limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
              tokens,
              ids.transactionId,
              ids.submissionId
            );

            response.render(
              super.templateName(pageRouting.currentUrl),
              super.makeProps(pageRouting, { limitedPartnership, generalPartners }, null)
            );
            return;
          }
        }

        let url = LIMITED_PARTNERS_URL;

        if (addAnotherGeneralPartner === "addPerson") {
          url = ADD_GENERAL_PARTNER_PERSON_URL;
        } else if (addAnotherGeneralPartner === "addLegalEntity") {
          url = ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL;
        }

        const redirectUrl = super.insertIdsInUrl(url, ids.transactionId, ids.submissionId);

        response.redirect(redirectUrl);
      } catch (error) {
        next(error);
      }
    };
  }

  postRemovePage(): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { ids, tokens } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, RegistrationPageType);
        const pageRouting = super.getRouting(registrationsRouting, pageType, request);

        const remove = request.body.remove;

        if (remove === "yes") {
          await this.generalPartnerService.deleteGeneralPartner(tokens, ids.transactionId, ids.generalPartnerId);
        }

        response.redirect(pageRouting.nextUrl);
      } catch (error) {
        next(error);
      }
    };
  }
}

export default GeneralPartnerController;
