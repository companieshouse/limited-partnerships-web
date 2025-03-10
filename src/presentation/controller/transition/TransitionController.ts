import { NextFunction, Request, RequestHandler, Response } from "express";
import AbstractController from "../AbstractController";
import transitionRouting from "./Routing";
import TransitionPageType from "./PageType";
import CompanyService from "../../../application/service/CompanyService";
import CacheService from "../../../application/service/CacheService";
import {
  APPLICATION_CACHE_KEY,
  APPLICATION_CACHE_KEY_PREFIX_REGISTRATION,
  cookieOptions
} from "../../../config/constants";

class TransitionController extends AbstractController {
  constructor(private companyService: CompanyService, private cacheService: CacheService) {
    super();
  }

  getPageRouting(): RequestHandler {
    return (request: Request, response: Response, next: NextFunction) => {
      try {
        const { pageType } = super.extract(request);
        const pageRouting = super.getRouting(transitionRouting, pageType, request);

        const cache = this.cacheService.getDataFromCache(request.signedCookies);

        response.render(
          super.templateName(pageRouting.currentUrl),
          super.makeProps(pageRouting, { cache }, null)
        );
      } catch (error) {
        next(error);
      }
    };
  }

  checkCompanyNumber(): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, TransitionPageType);
        const pageRouting = super.getRouting(transitionRouting, pageType, request);
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
          [`${APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}company_number`]: company_number
        });
        response.cookie(APPLICATION_CACHE_KEY, cache, cookieOptions);

        response.redirect(pageRouting.nextUrl);
      } catch (error) {
        console.error(error);
        next(error);
      }
    };
  }
}

export default TransitionController;
