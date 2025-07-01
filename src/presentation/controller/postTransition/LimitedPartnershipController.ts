import { NextFunction, Request, Response } from "express";

import AbstractController from "../AbstractController";
import {
  APPLICATION_CACHE_KEY,
  APPLICATION_CACHE_KEY_PREFIX_POST_TRANSITION,
  cookieOptions
} from "../../../config/constants";

import CompanyService from "../../../application/service/CompanyService";
import CacheService from "../../../application/service/CacheService";
import LimitedPartnershipService from "../../../application/service/LimitedPartnershipService";
import postTransitionRouting from "./routing";
import PostTransitionPageType from "./pageType";

class LimitedPartnershipController extends AbstractController {
  constructor(
    private readonly companyService: CompanyService,
    private readonly cacheService: CacheService,
    private readonly limitedPartnershipService: LimitedPartnershipService
  ) {
    super();
  }

  getPageRouting() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, pageType, ids } = super.extract(request);
        const pageRouting = super.getRouting(postTransitionRouting, pageType, request);

        let limitedPartnership = {};

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
          super.makeProps(pageRouting, { limitedPartnership, cache }, null)
        );
      } catch (error) {
        next(error);
      }
    };
  }

  getConfirmPage() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens } = super.extract(request);
        const { pageType } = super.extract(request);
        const pageRouting = super.getRouting(postTransitionRouting, pageType, request);

        const cache = this.cacheService.getDataFromCache(request.signedCookies);
        const result = await this.companyService.getCompanyProfile(
          tokens,
          cache[`${APPLICATION_CACHE_KEY_PREFIX_POST_TRANSITION}company_number`]
        );

        if (result.errors) {
          response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(pageRouting, null, result.errors)
          );

          return;
        }

        response.render(
          super.templateName(pageRouting.currentUrl),
          super.makeProps(pageRouting, { company: result.companyProfile }, null)
        );
      } catch (error) {
        next(error);
      }
    };
  }

  checkCompanyNumber() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, PostTransitionPageType);
        const pageRouting = super.getRouting(postTransitionRouting, pageType, request);
        const { company_number } = request.body;

        const result = await this.companyService.getCompanyProfile(tokens, company_number);

        if (result.errors) {
          response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(pageRouting, { company_number }, result.errors)
          );

          return;
        }

        const cache = this.cacheService.addDataToCache(request.signedCookies, {
          [`${APPLICATION_CACHE_KEY_PREFIX_POST_TRANSITION}company_number`]: company_number
        });
        response.cookie(APPLICATION_CACHE_KEY, cache, cookieOptions);

        response.redirect(pageRouting.nextUrl);
      } catch (error) {
        next(error);
      }
    };
  }

  limitedPartnershipConfirm() {
    return (request: Request, response: Response, next: NextFunction) => {
      try {
        const { pageType, ids } = super.extract(request);
        const pageRouting = super.getRouting(postTransitionRouting, pageType, request);

        const url = super.insertIdsInUrl(pageRouting.nextUrl, ids, request.url);

        response.redirect(url);
      } catch (error) {
        next(error);
      }
    };
  }
}

export default LimitedPartnershipController;
