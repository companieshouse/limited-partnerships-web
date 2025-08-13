import { NextFunction, Request, Response } from "express";
import { LimitedPartner } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

import AbstractController from "../AbstractController";
import { Ids, Tokens } from "../../../domain/types";
import LimitedPartnerService from "../../../application/service/LimitedPartnerService";
import LimitedPartnershipService from "../../../application/service/LimitedPartnershipService";
import { PageRouting } from "../PageRouting";
import UIErrors from "../../../domain/entities/UIErrors";

import { getJourneyTypes } from "../../../utils/journey";

import RegistrationPageType from "../registration/PageType";
import TransitionPageType from "../transition/PageType";
import PostTransitionPageType from "../postTransition/pageType";

import registrationRouting from "../registration/Routing";
import transitionRouting from "../transition/Routing";
import postTransitionRouting from "../postTransition/routing";

import CompanyService from "../../../application/service/CompanyService";

class LimitedPartnerController extends AbstractController {
  constructor(
    protected readonly limitedPartnershipService: LimitedPartnershipService,
    protected readonly limitedPartnerService: LimitedPartnerService,
    protected readonly companyService?: CompanyService
  ) {
    super();
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

        if (this.companyService) {
          limitedPartnership = await this.getLimitedPartnershipDetails(tokens, ids.companyId);
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

  private async getLimitedPartnershipDetails(tokens: Tokens, companyId: string): Promise<Record<string, any>> {
    const result = await (this.companyService as CompanyService).getCompanyProfile(tokens, companyId);

    return {
      data: {
        partnership_name: result.companyProfile.companyName,
        partnership_number: result.companyProfile.companyNumber
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

        const addAnotherLimitedPartner = request.body.addAnotherPartner;

        if (addAnotherLimitedPartner === "no") {
          const redirectUrl = super.insertIdsInUrl(pageRouting.nextUrl, ids, request.url);

          response.redirect(redirectUrl);
          return;
        }

        let url = urls.checkYourAnswersUrl;

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
      (pageRouting.pageType === pageType.addLimitedPartnerLegalEntity ||
        pageRouting.pageType === pageType.addLimitedPartnerPerson) &&
      pageRouting.data?.customPreviousUrl
    ) {
      const result = await this.limitedPartnerService.getLimitedPartners(tokens, ids.transactionId);
      if (result.limitedPartners.length > 0) {
        pageRouting.previousUrl = super.insertIdsInUrl(pageRouting.data?.customPreviousUrl, ids, request.url);
      }
    }
  }

  private getJourneyPageTypes(url: string) {
    const journeyTypes = getJourneyTypes(url);

    if (journeyTypes.isRegistration) {
      return RegistrationPageType;
    } else if (journeyTypes.isTransition) {
      return TransitionPageType;
    } else {
      return PostTransitionPageType;
    }
  }

  private getJourneyPageRouting(url: string) {
    const journeyTypes = getJourneyTypes(url);

    if (journeyTypes.isRegistration) {
      return registrationRouting;
    } else if (journeyTypes.isTransition) {
      return transitionRouting;
    } else {
      return postTransitionRouting;
    }
  }
}

export default LimitedPartnerController;
