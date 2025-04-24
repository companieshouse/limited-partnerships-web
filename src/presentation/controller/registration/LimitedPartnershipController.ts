import { NextFunction, Request, RequestHandler, Response } from "express";
import escape from "escape-html";
import { LimitedPartnership, PartnershipType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import LimitedPartnershipService from "../../../application/service/LimitedPartnershipService";
import registrationsRouting from "./Routing";
import AbstractController from "../AbstractController";
import RegistrationPageType from "./PageType";
import {
  APPLICATION_CACHE_KEY,
  APPLICATION_CACHE_KEY_PREFIX_REGISTRATION,
  cookieOptions
} from "../../../config/constants";
import CacheService from "../../../application/service/CacheService";
import PageType from "../PageType";
import { GENERAL_PARTNERS_URL, NAME_WITH_IDS_URL, WHICH_TYPE_WITH_IDS_URL } from "./url";
import { PageRouting } from "../PageRouting";

class LimitedPartnershipController extends AbstractController {
  private limitedPartnershipService: LimitedPartnershipService;
  private cacheService: CacheService;

  constructor(limitedPartnershipService: LimitedPartnershipService, cacheService: CacheService) {
    super();
    this.limitedPartnershipService = limitedPartnershipService;
    this.cacheService = cacheService;
  }

  getPageRouting(): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, pageType, ids } = super.extract(request);
        const pageRouting = super.getRouting(registrationsRouting, pageType, request);

        this.conditionalPreviousUrl(pageType, ids, pageRouting);

        let limitedPartnership = {};
        const generalPartner = {};
        const limitedPartner = {};

        if (ids.transactionId && ids.submissionId) {
          limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
            tokens,
            ids.transactionId,
            ids.submissionId
          );
        }

        const cache = this.cacheService.getDataFromCache(request.signedCookies);

        response.render(
          super.templateName(pageRouting.currentUrl),
          super.makeProps(pageRouting, { limitedPartnership, generalPartner, limitedPartner, cache, ids }, null)
        );
      } catch (error) {
        next(error);
      }
    };
  }

  private conditionalPreviousUrl(
    pageType: PageType,
    ids: { transactionId: string; submissionId: string; generalPartnerId: string },
    pageRouting: PageRouting
  ) {
    if (pageType === RegistrationPageType.name) {
      // change back link if we have ids in url
      if (ids.transactionId && ids.submissionId) {
        pageRouting.previousUrl = super.insertIdsInUrl(WHICH_TYPE_WITH_IDS_URL, ids.transactionId, ids.submissionId);
      }
    }
  }

  createTransactionAndFirstSubmission(): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, RegistrationPageType);
        const pageRouting = super.getRouting(registrationsRouting, pageType, request);
        const journeyTypes = super.getJourneyTypes(pageRouting.currentUrl);

        const result = await this.limitedPartnershipService.createTransactionAndFirstSubmission(
          tokens,
          pageType,
          journeyTypes,
          request.body
        );

        if (result.errors) {
          const cache = this.cacheService.getDataFromCache(request.signedCookies);

          response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(pageRouting, { limitedPartnership: { data: request.body }, cache }, result.errors)
          );

          return;
        }

        const url = super.insertIdsInUrl(pageRouting.nextUrl, result.transactionId, result.submissionId);

        const cacheUpdated = this.cacheService.removeDataFromCache(
          request.signedCookies,
          `${APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}${RegistrationPageType.whichType}`
        );
        response.cookie(APPLICATION_CACHE_KEY, cacheUpdated, cookieOptions);

        response.redirect(url);
      } catch (error) {
        next(error);
      }
    };
  }

  closeTransaction(): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, ids } = super.extract(request);

        // TODO Use the response from this call to get hold of the payment URL, when the
        //      payment journey is implemented
        //
        //      E.g.   apiResponse.headers?.["x-payment-required"];
        await this.limitedPartnershipService.closeTransaction(tokens, ids.transactionId);

        const pageType = super.extractPageTypeOrThrowError(request, RegistrationPageType);
        const pageRouting = super.getRouting(registrationsRouting, pageType, request);

        response.redirect(pageRouting.nextUrl);
      } catch (error) {
        next(error);
      }
    };
  }

  redirectWhichTypeWithIds(): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, ids } = super.extract(request);

        const selectedPartnershipType = escape(request.body.parameter);

        const limitedPartnership: LimitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
          tokens,
          ids.transactionId,
          ids.submissionId
        );

        if (selectedPartnershipType !== limitedPartnership?.data?.partnership_type) {
          return this.redirectAndCacheSelection()(request, response, next);
        }

        const redirectUrl = this.insertIdsInUrl(NAME_WITH_IDS_URL, ids.transactionId, ids.submissionId);
        response.redirect(redirectUrl);
      } catch (error) {
        next(error);
      }
    };
  }

  redirectAndCacheSelection(): RequestHandler {
    return (request: Request, response: Response, next: NextFunction) => {
      try {
        const type = super.extractPageTypeOrThrowError(request, RegistrationPageType);
        const pageRouting = super.getRouting(registrationsRouting, type, request);

        const pageType = escape(request.body.pageType);
        const parameter = escape(request.body.parameter);

        const cache = this.cacheService.addDataToCache(request.signedCookies, {
          [`${APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}${pageType}`]: parameter
        });
        response.cookie(APPLICATION_CACHE_KEY, cache, cookieOptions);

        response.redirect(pageRouting.nextUrl);
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

        const result = await this.limitedPartnershipService.sendPageData(
          tokens,
          ids.transactionId,
          ids.submissionId,
          pageType,
          request.body
        );

        if (result?.errors) {
          response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(pageRouting, null, result.errors)
          );
          return;
        }

        response.redirect(pageRouting.nextUrl);
      } catch (error) {
        next(error);
      }
    };
  }

  getPageRoutingTermSic(): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, pageType, ids } = super.extract(request);
        const pageRouting = super.getRouting(registrationsRouting, pageType, request);

        let limitedPartnership: LimitedPartnership = {};

        if (ids.transactionId && ids.submissionId) {
          limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
            tokens,
            ids.transactionId,
            ids.submissionId
          );
        }

        if (
          (pageType === RegistrationPageType.term || pageType === RegistrationPageType.sic) &&
          (limitedPartnership?.data?.partnership_type === PartnershipType.PFLP ||
            limitedPartnership?.data?.partnership_type === PartnershipType.SPFLP)
        ) {
          const { transactionId, submissionId } = super.extractIds(request);

          const url = super.insertIdsInUrl(GENERAL_PARTNERS_URL, transactionId, submissionId);

          response.redirect(url);

          return;
        }

        response.render(
          super.templateName(pageRouting.currentUrl),
          super.makeProps(pageRouting, { limitedPartnership, ids }, null)
        );
      } catch (error) {
        next(error);
      }
    };
  }

  sendSicCodesPageData(): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, ids } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, RegistrationPageType);
        const pageRouting = super.getRouting(registrationsRouting, pageType, request);

        const sic_codes: string[] = [];

        for (let i = 1; i <= 4; i++) {
          if (request.body[`sic${i}`]) {
            sic_codes.push(request.body[`sic${i}`]);
          }
        }

        const result = await this.limitedPartnershipService.sendPageData(
          tokens,
          ids.transactionId,
          ids.submissionId,
          pageType,
          { sic_codes }
        );

        if (result?.errors) {
          response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(pageRouting, null, result.errors)
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

export default LimitedPartnershipController;
