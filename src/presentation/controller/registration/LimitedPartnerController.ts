import { NextFunction, Request, Response } from "express";

import LimitedPartnershipService from "../../../application/service/LimitedPartnershipService";
import LimitedPartnerService from "../../../application/service/LimitedPartnerService";
import registrationsRouting from "./Routing";
import AbstractController from "../AbstractController";
import RegistrationPageType from "./PageType";
import { ADD_LIMITED_PARTNER_PERSON_URL, ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL, CHECK_YOUR_ANSWERS_URL, LIMITED_PARTNERS_URL } from "./url";
import { LimitedPartner } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";
import { PageRouting } from "../PageRouting";

class LimitedPartnerController extends AbstractController {
  private readonly limitedPartnershipService: LimitedPartnershipService;
  private readonly limitedPartnerService: LimitedPartnerService;

  constructor(limitedPartnershipService: LimitedPartnershipService, limitedPartnerService: LimitedPartnerService) {
    super();
    this.limitedPartnershipService = limitedPartnershipService;
    this.limitedPartnerService = limitedPartnerService;
  }

  getPageRouting() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, pageType, ids } = super.extract(request);
        const pageRouting = super.getRouting(registrationsRouting, pageType, request);

        this.conditionalPreviousUrl(ids, pageRouting, request);

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

  private conditionalPreviousUrl(
    ids: { transactionId: string; submissionId: string; generalPartnerId: string },
    pageRouting: PageRouting,
    request: Request
  ) {
    const previousPageType = super.pageType(request.get("Referrer") ?? "");

    if (
      pageRouting.pageType === RegistrationPageType.addLimitedPartnerLegalEntity ||
      pageRouting.pageType === RegistrationPageType.addLimitedPartnerPerson
    ) {
      if (previousPageType === RegistrationPageType.reviewLimitedPartners) {
        pageRouting.previousUrl = super.insertIdsInUrl(
          pageRouting.data?.customPreviousUrl,
          ids.transactionId,
          ids.submissionId
        );
      }
    }
  }

  limitedPartnerChoice() {
    return (request: Request, response: Response, next: NextFunction) => {
      try {
        const { ids } = super.extract(request);

        let url =
          request.body.parameter === "person" ? ADD_LIMITED_PARTNER_PERSON_URL : ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL;

        url = super.insertIdsInUrl(url, ids.transactionId, ids.submissionId);

        url = response.locals.languageEnabled ? `${url}?lang=${response.locals.lang}` : url;

        response.redirect(url);
      } catch (error) {
        next(error);
      }
    };
  }

  getReviewPage() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, pageType, ids } = super.extract(request);
        const pageRouting = super.getRouting(registrationsRouting, pageType, request);

        let limitedPartnership = {};
        let limitedPartners: LimitedPartner[] = [];

        if (ids.transactionId && ids.submissionId) {
          limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
            tokens,
            ids.transactionId,
            ids.submissionId
          );

          limitedPartners = await this.limitedPartnerService.getLimitedPartners(tokens, ids.transactionId);
        }

        if (limitedPartners.length === 0) {
          let redirect = super.insertIdsInUrl(LIMITED_PARTNERS_URL, ids.transactionId, ids.submissionId);

          redirect = response.locals.languageEnabled ? `${redirect}?lang=${response.locals.lang}` : redirect;

          response.redirect(redirect);
          return;
        }

        response.render(
          super.templateName(pageRouting.currentUrl),
          super.makeProps(pageRouting, { limitedPartnership, limitedPartners }, null)
        );
      } catch (error) {
        next(error);
      }
    };
  }

  createLimitedPartner() {
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
          "",
          result.limitedPartnerId
        );

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

  postReviewPage() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { ids, tokens } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, RegistrationPageType);
        const pageRouting = super.getRouting(registrationsRouting, pageType, request);

        const addAnotherLimitedPartner = request.body.addAnotherLimitedPartner;

        if (addAnotherLimitedPartner === "no") {
          const limitedPartners = await this.limitedPartnerService.getLimitedPartners(tokens, ids.transactionId);

          if (limitedPartners.length === 0) {
            const limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
              tokens,
              ids.transactionId,
              ids.submissionId
            );

            response.render(
              super.templateName(pageRouting.currentUrl),
              super.makeProps(pageRouting, { limitedPartnership, limitedPartners }, null)
            );
            return;
          }
        }

        let url = CHECK_YOUR_ANSWERS_URL;

        if (addAnotherLimitedPartner === "addPerson") {
          url = ADD_LIMITED_PARTNER_PERSON_URL;
        } else if (addAnotherLimitedPartner === "addLegalEntity") {
          url = ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL;
        }

        let redirectUrl = super.insertIdsInUrl(url, ids.transactionId, ids.submissionId);

        redirectUrl = response.locals.languageEnabled ? `${redirectUrl}?lang=${response.locals.lang}` : redirectUrl;

        response.redirect(redirectUrl);
      } catch (error) {
        next(error);
      }
    };
  }

  postRemovePage() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { ids, tokens } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, RegistrationPageType);
        const pageRouting = super.getRouting(registrationsRouting, pageType, request);

        const remove = request.body.remove;

        if (remove === "yes") {
          await this.limitedPartnerService.deleteLimitedPartner(tokens, ids.transactionId, ids.limitedPartnerId);
        }

        response.redirect(pageRouting.nextUrl);
      } catch (error) {
        next(error);
      }
    };
  }
}

export default LimitedPartnerController;
