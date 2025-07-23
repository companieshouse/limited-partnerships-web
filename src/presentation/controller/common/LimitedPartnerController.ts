import { NextFunction, Request, Response } from "express";

import AbstractController from "../AbstractController";
import { Ids, Tokens } from "../../../domain/types";
import LimitedPartnerService from "../../../application/service/LimitedPartnerService";
import LimitedPartnershipService from "../../../application/service/LimitedPartnershipService";

import { getJourneyTypes } from "../../../utils/journey";
import RegistrationPageType from "../registration/PageType";
import TransitionPageType from "../transition/PageType";
import registrationRouting from "../registration/Routing";
import transitionRouting from "../transition/Routing";
import { PageRouting } from "../PageRouting";
import { LimitedPartner } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";
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

        const routing = this.getJourneyPageRouting(request.url);

        const { tokens, pageType, ids } = super.extract(request);
        const pageRouting = super.getRouting(routing, pageType, request);

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
        console.error("Error in getPageRouting:", error);
        next(error);
      }
    };
  }

  getLimitedPartner(urls: { reviewLimitedPartnersUrl: string }) {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        this.limitedPartnerService.setI18n(response.locals.i18n);

        const routing = this.getJourneyPageRouting(request.url);

        const { tokens, pageType, ids } = super.extract(request);
        const pageRouting = super.getRouting(routing, pageType, request);

        const result = await this.limitedPartnerService.getLimitedPartners(tokens, ids.transactionId);

        if (result.limitedPartners.length > 0) {
          response.redirect(super.insertIdsInUrl(urls.reviewLimitedPartnersUrl, ids, request.url));
          return;
        }

        let limitedPartnership = {};

        if (ids.transactionId && ids.submissionId) {
          limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
            tokens,
            ids.transactionId,
            ids.submissionId
          );
        }

        response.render(
          super.templateName(pageRouting.currentUrl),
          super.makeProps(pageRouting, { limitedPartnership }, null)
        );
      } catch (error) {
        next(error);
      }
    };
  }

  limitedPartnerChoice(urls: { addPersonUrl: string; addLegalEntityUrl: string }) {
    return (request: Request, response: Response, next: NextFunction) => {
      try {
        const { ids } = super.extract(request);

        let url = request.body.parameter === "person" ? urls.addPersonUrl : urls.addLegalEntityUrl;

        url = super.insertIdsInUrl(url, ids, request.url);

        response.redirect(url);
      } catch (error) {
        next(error);
      }
    };
  }

  getReviewPage(urls: { limitedPartnersUrl: string }) {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        this.limitedPartnerService.setI18n(response.locals.i18n);

        const routing = this.getJourneyPageRouting(request.url);

        const { tokens, pageType, ids } = super.extract(request);
        const pageRouting = super.getRouting(routing, pageType, request);

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
          const redirect = super.insertIdsInUrl(urls.limitedPartnersUrl, ids, request.url);

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
        const routing = this.getJourneyPageRouting(request.url);
        const journeyPageType = this.getJourneyPageTypes(request.url);

        const { tokens, ids } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, journeyPageType);
        const pageRouting = super.getRouting(routing, pageType, request);

        const result = await this.limitedPartnerService.createLimitedPartner(tokens, ids.transactionId, request.body);

        if (result.errors) {
          const limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
            tokens,
            ids.transactionId,
            ids.submissionId
          );

          response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(
              pageRouting,
              {
                limitedPartnership,
                limitedPartner: { data: request.body }
              },
              result.errors
            )
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

  sendPageData(urls: {
    confirmLimitedPartnerUsualResidentialAddressUrl: string;
    confirmLimitedPartnerPrincipalOfficeAddressUrl: string;
  }) {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const routing = this.getJourneyPageRouting(request.url);
        const journeyPageType = this.getJourneyPageTypes(request.url);

        const { tokens, ids } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, journeyPageType);
        const pageRouting = super.getRouting(routing, pageType, request);

        const result = await this.limitedPartnerService.sendPageData(
          tokens,
          ids.transactionId,
          ids.limitedPartnerId,
          request.body
        );

        if (result?.errors) {
          const limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
            tokens,
            ids.transactionId,
            ids.submissionId
          );

          await this.conditionalPreviousUrl(ids, pageRouting, request, tokens);

          response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(
              pageRouting,
              {
                limitedPartnership,
                limitedPartner: { data: request.body }
              },
              result.errors
            )
          );
          return;
        }

        await this.conditionalLimitedPartner(ids, pageRouting, request, tokens, {
          confirmLimitedPartnerUsualResidentialAddressUrl: urls.confirmLimitedPartnerUsualResidentialAddressUrl,
          confirmLimitedPartnerPrincipalOfficeAddressUrl: urls.confirmLimitedPartnerPrincipalOfficeAddressUrl
        });

        response.redirect(pageRouting.nextUrl);
      } catch (error) {
        next(error);
      }
    };
  }

  private async conditionalLimitedPartner(
    ids: Ids,
    pageRouting: PageRouting,
    request: Request,
    tokens: Tokens,
    urls: {
      confirmLimitedPartnerUsualResidentialAddressUrl: string;
      confirmLimitedPartnerPrincipalOfficeAddressUrl: string;
    }
  ) {
    const journeyPageType = this.getJourneyPageTypes(request.url);

    if (pageRouting.pageType === journeyPageType.addLimitedPartnerPerson) {
      const limitedPartner = await this.limitedPartnerService.getLimitedPartner(
        tokens,
        ids.transactionId,
        ids.limitedPartnerId
      );

      if (limitedPartner?.data?.usual_residential_address?.address_line_1) {
        pageRouting.nextUrl = super.insertIdsInUrl(
          urls.confirmLimitedPartnerUsualResidentialAddressUrl,
          ids,
          request.url
        );
      }
    } else if (pageRouting.pageType === journeyPageType.addLimitedPartnerLegalEntity) {
      const limitedPartner = await this.limitedPartnerService.getLimitedPartner(
        tokens,
        ids.transactionId,
        ids.limitedPartnerId
      );

      if (limitedPartner?.data?.principal_office_address?.address_line_1) {
        pageRouting.nextUrl = super.insertIdsInUrl(
          urls.confirmLimitedPartnerPrincipalOfficeAddressUrl,
          ids,
          request.url
        );
      }
    }
  }

  postReviewPage(urls: {
    addLimitedPartnerPersonUrl: string;
    addLimitedPartnerLegalEntityUrl: string;
    checkYourAnswersUrl: string;
  }) {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        this.limitedPartnerService.setI18n(response.locals.i18n);

        const routing = this.getJourneyPageRouting(request.url);
        const journeyPageType = this.getJourneyPageTypes(request.url);

        const { ids, tokens } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, journeyPageType);
        const pageRouting = super.getRouting(routing, pageType, request);

        const result = await this.limitedPartnerService.getLimitedPartners(tokens, ids.transactionId);

        if (result.limitedPartners.length === 0 || result?.errors?.hasErrors()) {
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

        const addAnotherGeneralPartner = request.body.addAnotherGeneralPartner;

        if (addAnotherGeneralPartner === "no") {
          const redirectUrl = super.insertIdsInUrl(pageRouting.nextUrl, ids, request.url);

          response.redirect(redirectUrl);
          return;
        }

        let url = urls.checkYourAnswersUrl;
        const addAnotherLimitedPartner = request.body.addAnotherLimitedPartner;

        if (addAnotherLimitedPartner === "addPerson") {
          url = urls.addLimitedPartnerPersonUrl;
        } else if (addAnotherLimitedPartner === "addLegalEntity") {
          url = urls.addLimitedPartnerLegalEntityUrl;
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
        const routing = this.getJourneyPageRouting(request.url);
        const journeyPageType = this.getJourneyPageTypes(request.url);

        const { ids, tokens } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, journeyPageType);
        const pageRouting = super.getRouting(routing, pageType, request);

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

  private async conditionalPreviousUrl(ids: Ids, pageRouting: PageRouting, request: Request, tokens) {
    const pageType = this.getJourneyPageTypes(request.url);

    if (
      pageRouting.pageType === pageType.addLimitedPartnerLegalEntity ||
      pageRouting.pageType === pageType.addLimitedPartnerPerson
    ) {
      const result = await this.limitedPartnerService.getLimitedPartners(tokens, ids.transactionId);
      if (result.limitedPartners.length > 0) {
        pageRouting.previousUrl = super.insertIdsInUrl(pageRouting.data?.customPreviousUrl, ids, request.url);
      }
    }
  }

  private getJourneyPageTypes(url: string) {
    return getJourneyTypes(url).isRegistration ? RegistrationPageType : TransitionPageType;
  }

  private getJourneyPageRouting(url: string) {
    return getJourneyTypes(url).isRegistration ? registrationRouting : transitionRouting;
  }
}

export default LimitedPartnerController;
