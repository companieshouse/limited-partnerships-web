import { NextFunction, Request, RequestHandler, Response } from "express";
import escape from "escape-html";
import {
  LimitedPartnership,
  PartnershipType
} from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

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
import { GENERAL_PARTNERS_URL } from "./url";

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

        const redirect = this.conditionalRedirecting(
          request,
          response,
          pageType,
          limitedPartnership
        );

        if (!redirect) {
          response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(
              pageRouting,
              { limitedPartnership, generalPartner, limitedPartner, cache, ids },
              null
            )
          );
        }
      } catch (error) {
        next(error);
      }
    };
  }

  private conditionalRedirecting(
    request: Request,
    response: Response,
    pageType: PageType,
    limitedPartnership: LimitedPartnership
  ): boolean {
    let redirect = false;

    // Redirect to general partners page if partnership type is PFLP or SPFLP instead of term page
    if (
      pageType === RegistrationPageType.term &&
      (limitedPartnership.data?.partnership_type === PartnershipType.PFLP ||
        limitedPartnership.data?.partnership_type === PartnershipType.SPFLP)
    ) {
      const { transactionId, submissionId } = super.extractIds(request);

      const url = super.insertIdsInUrl(GENERAL_PARTNERS_URL, transactionId, submissionId);

      response.redirect(url);

      redirect = true;
    }

    return redirect;
  }

  createTransactionAndFirstSubmission(): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, RegistrationPageType);
        const pageRouting = super.getRouting(registrationsRouting, pageType, request);

        const result = await this.limitedPartnershipService.createTransactionAndFirstSubmission(
          tokens,
          pageType,
          request.body
        );

        if (result.errors) {
          const cache = this.cacheService.getDataFromCache(request.signedCookies);

          response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(
              pageRouting,
              { limitedPartnership: { data: request.body }, cache },
              result.errors
            )
          );

          return;
        }

        const url = super.insertIdsInUrl(
          pageRouting.nextUrl,
          result.transactionId,
          result.submissionId
        );

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
}

export default LimitedPartnershipController;
