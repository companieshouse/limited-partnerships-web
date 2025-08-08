import { NextFunction, Request, Response } from "express";
import { GeneralPartner } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

import AbstractController from "../AbstractController";
import { Ids, Tokens } from "../../../domain/types";
import LimitedPartnershipService from "../../../application/service/LimitedPartnershipService";
import GeneralPartnerService from "../../../application/service/GeneralPartnerService";
import LimitedPartnerService from "../../../application/service/LimitedPartnerService";
import { PageRouting } from "../PageRouting";
import UIErrors from "../../../domain/entities/UIErrors";

import { getJourneyTypes } from "../../../utils/journey";
import RegistrationPageType from "../registration/PageType";
import TransitionPageType from "../transition/PageType";
import PostTransitionPageType from "../postTransition/pageType";

import registrationRouting from "../registration/Routing";
import transitionRouting from "../transition/Routing";
import postTransitionRouting from "../postTransition/routing";

import { APPLICATION_CACHE_KEY_COMPANY_NUMBER } from "../../../config/constants";
import CacheService from "../../../application/service/CacheService";
import CompanyService from "../../../application/service/CompanyService";

abstract class GeneralPartnerController extends AbstractController {
  constructor(
    protected readonly limitedPartnershipService: LimitedPartnershipService,
    protected readonly generalPartnerService: GeneralPartnerService,
    protected readonly limitedPartnerService: LimitedPartnerService,
    protected readonly cacheService?: CacheService,
    protected readonly companyService?: CompanyService
  ) {
    super();
  }

  getPageRouting() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        this.generalPartnerService.setI18n(response.locals.i18n);

        const routing = this.getJourneyPageRouting(request.url);

        const { tokens, pageType, ids } = super.extract(request);
        const pageRouting = super.getRouting(routing, pageType, request);

        await this.conditionalPreviousUrl(ids, pageRouting, request, tokens);

        let limitedPartnership = {};
        let generalPartner = {};
        let companyProfile = {};

        if (ids.transactionId && ids.submissionId) {
          limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
            tokens,
            ids.transactionId,
            ids.submissionId
          );
        }

        if (this.cacheService && this.companyService) {
          limitedPartnership = await this.getLimitedPartnershipDetails(request, tokens);
        }

        if (ids.transactionId && ids.generalPartnerId) {
          generalPartner = await this.generalPartnerService.getGeneralPartner(
            tokens,
            ids.transactionId,
            ids.generalPartnerId
          );
        }

        if (this.cacheService && this.companyService) {
          const cache = this.cacheService?.getDataFromCache(request.signedCookies);
          const company = await this.companyService.getCompanyProfile(
            tokens,
            cache[APPLICATION_CACHE_KEY_COMPANY_NUMBER]
          );
          companyProfile = company.companyProfile;
        }

        response.render(
          super.templateName(pageRouting.currentUrl),
          super.makeProps(pageRouting, { limitedPartnership, generalPartner, companyProfile }, null)
        );
      } catch (error) {
        console.log("Error in getPageRouting:", error);
        next(error);
      }
    };
  }

  private async getLimitedPartnershipDetails(request: Request, tokens: Tokens): Promise<Record<string, any>> {
    const cache = (this.cacheService as CacheService).getDataFromCache(request.signedCookies);

    const result = await (this.companyService as CompanyService).getCompanyProfile(
      tokens,
      cache[APPLICATION_CACHE_KEY_COMPANY_NUMBER]
    );

    return {
      data: {
        partnership_name: result.companyProfile.companyName,
        partnership_number: result.companyProfile.companyNumber
      }
    };
  }

  getGeneralPartner(urls: { reviewGeneralPartnersUrl: string }) {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        this.generalPartnerService.setI18n(response.locals.i18n);

        const routing = this.getJourneyPageRouting(request.url);

        const { tokens, pageType, ids } = super.extract(request);
        const pageRouting = super.getRouting(routing, pageType, request);

        const result = await this.generalPartnerService.getGeneralPartners(tokens, ids.transactionId);

        if (result.generalPartners.length > 0) {
          response.redirect(super.insertIdsInUrl(urls.reviewGeneralPartnersUrl, ids, request.url));
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

  generalPartnerChoice(urls: { addPersonUrl: string; addLegalEntityUrl: string }) {
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

  getReviewPage(urls: { generalPartnersUrl: string }) {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        this.generalPartnerService.setI18n(response.locals.i18n);

        const routing = this.getJourneyPageRouting(request.url);

        const { tokens, pageType, ids } = super.extract(request);
        const pageRouting = super.getRouting(routing, pageType, request);

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
          const redirect = super.insertIdsInUrl(urls.generalPartnersUrl, ids, request.url);

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
        const routing = this.getJourneyPageRouting(request.url);
        const journeyPageType = this.getJourneyPageTypes(request.url);

        const { tokens, ids } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, journeyPageType);
        const pageRouting = super.getRouting(routing, pageType, request);

        const result = await this.generalPartnerService.createGeneralPartner(tokens, ids.transactionId, request.body);

        if (result.errors) {
          const limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
            tokens,
            ids.transactionId,
            ids.submissionId
          );

          response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(pageRouting, { limitedPartnership, generalPartner: { data: request.body } }, result.errors)
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

  sendPageData(urls: {
    confirmGeneralPartnerUsualResidentialAddressUrl: string;
    confirmGeneralPartnerPrincipalOfficeAddressUrl: string;
  }) {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const routing = this.getJourneyPageRouting(request.url);
        const journeyPageType = this.getJourneyPageTypes(request.url);

        const { tokens, ids } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, journeyPageType);
        const pageRouting = super.getRouting(routing, pageType, request);

        const result = await this.generalPartnerService.sendPageData(
          tokens,
          ids.transactionId,
          ids.generalPartnerId,
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
                generalPartner: { data: request.body }
              },
              result.errors
            )
          );
          return;
        }

        await this.conditionalGeneralPartner(ids, pageRouting, request, tokens, {
          confirmGeneralPartnerUsualResidentialAddressUrl: urls.confirmGeneralPartnerUsualResidentialAddressUrl,
          confirmGeneralPartnerPrincipalOfficeAddressUrl: urls.confirmGeneralPartnerPrincipalOfficeAddressUrl
        });

        response.redirect(pageRouting.nextUrl);
      } catch (error) {
        next(error);
      }
    };
  }

  private async conditionalGeneralPartner(
    ids: Ids,
    pageRouting: PageRouting,
    request: Request,
    tokens: Tokens,
    urls: {
      confirmGeneralPartnerUsualResidentialAddressUrl: string;
      confirmGeneralPartnerPrincipalOfficeAddressUrl: string;
    }
  ) {
    const journeyPageType = this.getJourneyPageTypes(request.url);

    if (pageRouting.pageType === journeyPageType.addGeneralPartnerPerson) {
      const generalPartner = await this.generalPartnerService.getGeneralPartner(
        tokens,
        ids.transactionId,
        ids.generalPartnerId
      );

      if (generalPartner?.data?.usual_residential_address?.address_line_1) {
        pageRouting.nextUrl = super.insertIdsInUrl(
          urls.confirmGeneralPartnerUsualResidentialAddressUrl,
          ids,
          request.url
        );
      }
    } else if (pageRouting.pageType === journeyPageType.addGeneralPartnerLegalEntity) {
      const generalPartner = await this.generalPartnerService.getGeneralPartner(
        tokens,
        ids.transactionId,
        ids.generalPartnerId
      );

      if (generalPartner?.data?.principal_office_address?.address_line_1) {
        pageRouting.nextUrl = super.insertIdsInUrl(
          urls.confirmGeneralPartnerPrincipalOfficeAddressUrl,
          ids,
          request.url
        );
      }
    }
  }

  postReviewPage(urls: {
    addGeneralPartnerPersonUrl: string;
    addGeneralPartnerLegalEntityUrl: string;
    reviewLimitedPartnersUrl: string;
    limitedPartnerUrl: string;
  }) {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        this.generalPartnerService.setI18n(response.locals.i18n);

        const routing = this.getJourneyPageRouting(request.url);
        const journeyPageType = this.getJourneyPageTypes(request.url);

        const { ids, tokens } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, journeyPageType);
        const pageRouting = super.getRouting(routing, pageType, request);

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

        const addAnotherGeneralPartner = request.body.addAnotherPartner;

        if (addAnotherGeneralPartner === "no") {
          await this.conditionalNextUrl(tokens, ids, pageRouting, {
            reviewLimitedPartnersUrl: urls.reviewLimitedPartnersUrl
          });

          const redirectUrl = super.insertIdsInUrl(pageRouting.nextUrl, ids, request.url);

          response.redirect(redirectUrl);
          return;
        }

        let url = urls.limitedPartnerUrl;

        if (addAnotherGeneralPartner === "addPerson") {
          url = urls.addGeneralPartnerPersonUrl;
        } else if (addAnotherGeneralPartner === "addLegalEntity") {
          url = urls.addGeneralPartnerLegalEntityUrl;
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
          await this.generalPartnerService.deleteGeneralPartner(tokens, ids.transactionId, ids.generalPartnerId);
        }

        response.redirect(pageRouting.nextUrl);
      } catch (error) {
        next(error);
      }
    };
  }

  private async conditionalPreviousUrl(ids: Ids, pageRouting: PageRouting, request: Request, tokens: Tokens) {
    if (ids.submissionId) {
      const pageType = this.getJourneyPageTypes(request.url);

      if (
        pageRouting.pageType === pageType.addGeneralPartnerLegalEntity ||
        pageRouting.pageType === pageType.addGeneralPartnerPerson
      ) {
        const result = await this.generalPartnerService.getGeneralPartners(tokens, ids.transactionId);

        if (result.generalPartners.length > 0) {
          pageRouting.previousUrl = super.insertIdsInUrl(pageRouting.data?.customPreviousUrl, ids, request.url);
        }
      }
    }
  }

  private async conditionalNextUrl(
    tokens: Tokens,
    ids: Ids,
    pageRouting: PageRouting,
    urls: {
      reviewLimitedPartnersUrl: string;
    }
  ) {
    const result = await this.limitedPartnerService.getLimitedPartners(tokens, ids.transactionId);

    if (result.limitedPartners.length > 0) {
      pageRouting.nextUrl = super.insertIdsInUrl(urls.reviewLimitedPartnersUrl, ids);
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

export default GeneralPartnerController;
