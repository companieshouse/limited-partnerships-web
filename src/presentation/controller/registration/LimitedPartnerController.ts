import { NextFunction, Request, Response } from "express";

import LimitedPartnershipService from "../../../application/service/LimitedPartnershipService";
import LimitedPartnerService from "../../../application/service/LimitedPartnerService";
import registrationsRouting from "./Routing";
import AbstractController from "../AbstractController";
import RegistrationPageType from "./PageType";
import {
  ADD_LIMITED_PARTNER_PERSON_URL,
  ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
  CHECK_YOUR_ANSWERS_URL,
  LIMITED_PARTNERS_URL
} from "./url";
import { LimitedPartner } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";
import { PageRouting } from "../PageRouting";
import UIErrors from "../../../domain/entities/UIErrors";

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
        this.limitedPartnerService.setI18n(response.locals.i18n);

        const { tokens, pageType, ids } = super.extract(request);
        const pageRouting = super.getRouting(registrationsRouting, pageType, request);

        await this.conditionalPreviousUrl(ids, pageRouting, request, tokens);

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

  private async conditionalPreviousUrl(
    ids: { transactionId: string; submissionId: string; generalPartnerId: string },
    pageRouting: PageRouting,
    request: Request,
    tokens
  ) {
    const previousPageType = super.pageType(request.get("Referrer") ?? "");

    if (
      pageRouting.pageType === RegistrationPageType.addLimitedPartnerLegalEntity ||
      pageRouting.pageType === RegistrationPageType.addLimitedPartnerPerson
    ) {
      const result = await this.limitedPartnerService.getLimitedPartners(tokens, ids.transactionId);
      if (previousPageType === RegistrationPageType.reviewLimitedPartners || result.limitedPartners.length > 0) {
        pageRouting.previousUrl = super.insertIdsInUrl(pageRouting.data?.customPreviousUrl, ids);
      }
    }
  }

  limitedPartnerChoice() {
    return (request: Request, response: Response, next: NextFunction) => {
      try {
        const { ids } = super.extract(request);

        let url =
          request.body.parameter === "person" ? ADD_LIMITED_PARTNER_PERSON_URL : ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL;

        url = super.insertIdsInUrl(url, ids, response);

        response.redirect(url);
      } catch (error) {
        next(error);
      }
    };
  }

  getReviewPage() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        this.limitedPartnerService.setI18n(response.locals.i18n);

        const { tokens, pageType, ids } = super.extract(request);
        const pageRouting = super.getRouting(registrationsRouting, pageType, request);

        let limitedPartnership = {};
        let limitedPartners: LimitedPartner[] = [];
        let errors: UIErrors | null = null;

        if (ids.transactionId && ids.submissionId) {
          limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
            tokens,
            ids.transactionId,
            ids.submissionId
          );

          const result = await this.limitedPartnerService.getLimitedPartners(tokens, ids.transactionId);
          limitedPartners = result.limitedPartners;
          errors = result.errors ?? null;
        }

        if (limitedPartners.length === 0) {
          const redirect = super.insertIdsInUrl(LIMITED_PARTNERS_URL, ids, response);

          response.redirect(redirect);
          return;
        }

        response.render(
          super.templateName(pageRouting.currentUrl),
          super.makeProps(pageRouting, { limitedPartnership, limitedPartners }, errors)
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

        const newIds = { ...ids, limitedPartnerId: result.limitedPartnerId };

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
        this.limitedPartnerService.setI18n(response.locals.i18n);

        const { ids, tokens } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, RegistrationPageType);
        const pageRouting = super.getRouting(registrationsRouting, pageType, request);

        const result = await this.limitedPartnerService.getLimitedPartners(tokens, ids.transactionId);

        if (result.limitedPartners.length === 0 || result?.errors?.errors?.errorList.length) {
          const limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
            tokens,
            ids.transactionId,
            ids.submissionId
          );

          response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(
              pageRouting,
              { limitedPartnership, limitedPartners: result.limitedPartners },
              result.errors ?? null
            )
          );
          return;
        }

        let url = CHECK_YOUR_ANSWERS_URL;
        const addAnotherLimitedPartner = request.body.addAnotherLimitedPartner;

        if (addAnotherLimitedPartner === "addPerson") {
          url = ADD_LIMITED_PARTNER_PERSON_URL;
        } else if (addAnotherLimitedPartner === "addLegalEntity") {
          url = ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL;
        }

        const redirectUrl = super.insertIdsInUrl(url, ids, response);

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
