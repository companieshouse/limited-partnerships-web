import { NextFunction, Request, Response } from "express";
import { GeneralPartner } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

import transitionRouting from "./Routing";
import AbstractController from "../AbstractController";
import TransitionPageType from "./PageType";
import { ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL, ADD_GENERAL_PARTNER_PERSON_URL, GENERAL_PARTNERS_URL } from "./url";

import LimitedPartnershipService from "../../../application/service/LimitedPartnershipService";
import GeneralPartnerService from "../../../application/service/GeneralPartnerService";
import LimitedPartnerService from "../../../application/service/LimitedPartnerService";
import { PageRouting } from "../PageRouting";
import UIErrors from "../../../domain/entities/UIErrors";
import {
  CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
} from "../addressLookUp/url/transition";

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

        await this.conditionalPreviousUrl(ids, pageRouting, request, tokens);

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

  private async conditionalPreviousUrl(
    ids: { transactionId: string; submissionId: string; generalPartnerId: string },
    pageRouting: PageRouting,
    request: Request,
    tokens
  ) {
    const previousPageType = super.pageType(request.get("Referrer") ?? "");

    if (
      pageRouting.pageType === TransitionPageType.addGeneralPartnerLegalEntity ||
      pageRouting.pageType === TransitionPageType.addGeneralPartnerPerson
    ) {
      const result = await this.generalPartnerService.getGeneralPartners(tokens, ids.transactionId);

      if (previousPageType === TransitionPageType.reviewGeneralPartners || result.generalPartners.length > 0) {
        pageRouting.previousUrl = super.insertIdsInUrl(pageRouting.data?.customPreviousUrl, ids, request.url);
      }
    }
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

  getReviewPage() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        this.generalPartnerService.setI18n(response.locals.i18n);

        const { tokens, pageType, ids } = super.extract(request);
        const pageRouting = super.getRouting(transitionRouting, pageType, request);

        let limitedPartnership = {};
        let generalPartners: GeneralPartner[] = [];
        let errors: UIErrors | null = null;

        if (ids.transactionId && ids.submissionId) {
          limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
            tokens,
            ids.transactionId,
            ids.submissionId
          );

          const result = await this.generalPartnerService.getGeneralPartners(tokens, ids.transactionId);

          generalPartners = result.generalPartners;
          errors = result.errors ?? null;
        }

        if (generalPartners.length === 0) {
          const redirect = super.insertIdsInUrl(GENERAL_PARTNERS_URL, ids, request.url);

          response.redirect(redirect);
          return;
        }

        response.render(
          super.templateName(pageRouting.currentUrl),
          super.makeProps(pageRouting, { limitedPartnership, generalPartners }, errors)
        );
      } catch (error) {
        next(error);
      }
    };
  }

  createGeneralPartner() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, ids } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, TransitionPageType);
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
        const pageType = super.extractPageTypeOrThrowError(request, TransitionPageType);
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

        await this.conditionalGeneralPartner(ids, pageRouting, request, tokens);

        response.redirect(pageRouting.nextUrl);
      } catch (error) {
        next(error);
      }
    };
  }

  private async conditionalGeneralPartner(
    ids: { transactionId: string; submissionId: string; generalPartnerId: string },
    pageRouting: PageRouting,
    request: Request,
    tokens: {
      access_token: string;
      refresh_token: string;
    }
  ) {
    if (pageRouting.pageType === TransitionPageType.addGeneralPartnerPerson) {
      const generalPartner = await this.generalPartnerService.getGeneralPartner(
        tokens,
        ids.transactionId,
        ids.generalPartnerId
      );

      if (generalPartner?.data?.usual_residential_address?.address_line_1) {
        pageRouting.nextUrl = super.insertIdsInUrl(
          CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
          ids,
          request.url
        );
      }
    } else if (pageRouting.pageType === TransitionPageType.addGeneralPartnerLegalEntity) {
      const generalPartner = await this.generalPartnerService.getGeneralPartner(
        tokens,
        ids.transactionId,
        ids.generalPartnerId
      );

      if (generalPartner?.data?.principal_office_address?.address_line_1) {
        pageRouting.nextUrl = super.insertIdsInUrl(
          CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
          ids,
          request.url
        );
      }
    }
  }

  postReviewPage() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        this.generalPartnerService.setI18n(response.locals.i18n);

        const { ids, tokens } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, TransitionPageType);
        const pageRouting = super.getRouting(transitionRouting, pageType, request);

        const result = await this.generalPartnerService.getGeneralPartners(tokens, ids.transactionId);

        if (result?.errors?.hasErrors()) {
          const limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
            tokens,
            ids.transactionId,
            ids.submissionId
          );

          response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(
              pageRouting,
              { limitedPartnership, generalPartners: result.generalPartners },
              result.errors ?? null
            )
          );
          return;
        }

        const addAnotherGeneralPartner = request.body.addAnotherGeneralPartner;

        if (addAnotherGeneralPartner === "no") {
          const redirectUrl = super.insertIdsInUrl(pageRouting.nextUrl, ids, request.url);

          response.redirect(redirectUrl);
          return;
        }

        let url = "/"; // TODO change to LIMITED_PARTNERS_URL;

        if (addAnotherGeneralPartner === "addPerson") {
          url = ADD_GENERAL_PARTNER_PERSON_URL;
        } else if (addAnotherGeneralPartner === "addLegalEntity") {
          url = ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL;
        }

        const redirectUrl = super.insertIdsInUrl(url, ids, request.url);

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
        const pageType = super.extractPageTypeOrThrowError(request, TransitionPageType);
        const pageRouting = super.getRouting(transitionRouting, pageType, request);

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
