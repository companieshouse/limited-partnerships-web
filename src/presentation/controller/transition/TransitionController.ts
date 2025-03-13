import { NextFunction, Request, RequestHandler, Response } from "express";
import AbstractController from "../AbstractController";
import transitionRouting from "./Routing";
import TransitionPageType from "./PageType";
import CompanyService from "../../../application/service/CompanyService";
import CacheService from "../../../application/service/CacheService";
import {
  APPLICATION_CACHE_KEY,
  APPLICATION_CACHE_KEY_PREFIX_TRANSITION,
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

        response.render(super.templateName(pageRouting.currentUrl), super.makeProps(pageRouting, { cache }, null));
      } catch (error) {
        next(error);
      }
    };
  }

  getConfirmPage(): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens } = super.extract(request);
        const { pageType } = super.extract(request);
        const pageRouting = super.getRouting(transitionRouting, pageType, request);

        const cache = this.cacheService.getDataFromCache(request.signedCookies);
        const result = await this.companyService.getCompanyProfile(tokens, cache[`${APPLICATION_CACHE_KEY_PREFIX_TRANSITION}company_number`]);

        if (result.errors) {
          response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(pageRouting, null, result.errors)
          );

          return;
        }

        const formattedDate = this.formatDate(result.companyProfile.dateOfCreation, response.locals.i18n);

        response.render(
          super.templateName(pageRouting.currentUrl),
          super.makeProps(pageRouting, { company: result.companyProfile, dateOfCreation: formattedDate }, null)
        );
      } catch (error) {
        next(error);
      }
    };
  }

  limitedPartnershipConfirm(): RequestHandler {
    return (request: Request, response: Response, next: NextFunction) => {
      try {
        const { pageType } = super.extract(request);
        const pageRouting = super.getRouting(transitionRouting, pageType, request);

        const url = super.insertIdsInUrl(pageRouting.nextUrl, "172202-524517-416155", "67cef1bd031413260a6c83a9");

        response.redirect(url);
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
          [`${APPLICATION_CACHE_KEY_PREFIX_TRANSITION}company_number`]: company_number
        });
        response.cookie(APPLICATION_CACHE_KEY, cache, cookieOptions);

        response.redirect(pageRouting.nextUrl);
      } catch (error) {
        next(error);
      }
    };
  }

  private formatDate(date: string | undefined, translation: Record<string, any>) {
    const months: Record<string, string> = {
      "01": translation.months.january,
      "02": translation.months.february,
      "03": translation.months.march,
      "04": translation.months.april,
      "05": translation.months.may,
      "06": translation.months.june,
      "07": translation.months.july,
      "08": translation.months.august,
      "09": translation.months.september,
      "10": translation.months.october,
      "11": translation.months.november,
      "12": translation.months.december
    };

    if (date) {
      const [year, month, day] = date.split("-");
      return `${day} ${months[month]} ${year}`;
    }
  }
}

export default TransitionController;
