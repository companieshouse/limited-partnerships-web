import { NextFunction, Request, Response } from "express";
import AbstractController from "../AbstractController";
import transitionRouting from "./Routing";
import TransitionPageType from "./PageType";
import CompanyService from "../../../application/service/CompanyService";
import CacheService from "../../../application/service/CacheService";
import LimitedPartnershipService from "../../../application/service/LimitedPartnershipService";
import {
  APPLICATION_CACHE_KEY,
  APPLICATION_CACHE_KEY_PREFIX_TRANSITION,
  cookieOptions
} from "../../../config/constants";
import { getJourneyTypes } from "../../../utils/journey";
import { Jurisdiction, PartnershipType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";

class LimitedPartnershipController extends AbstractController {
  constructor(
    private readonly companyService: CompanyService,
    private readonly cacheService: CacheService,
    private readonly limitedPartnershipService: LimitedPartnershipService
  ) {
    super();
  }

  getPageRouting() {
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

  getConfirmPage() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens } = super.extract(request);
        const { pageType } = super.extract(request);
        const pageRouting = super.getRouting(transitionRouting, pageType, request);

        const cache = this.cacheService.getDataFromCache(request.signedCookies);
        const result = await this.companyService.getCompanyProfile(
          tokens,
          cache[`${APPLICATION_CACHE_KEY_PREFIX_TRANSITION}company_number`]
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

  limitedPartnershipConfirm() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { pageType, tokens } = super.extract(request);
        const pageRouting = super.getRouting(transitionRouting, pageType, request);
        const journeyTypes = getJourneyTypes(pageRouting.currentUrl);

        const cache = this.cacheService.getDataFromCache(request.signedCookies);
        const company_number = cache[`${APPLICATION_CACHE_KEY_PREFIX_TRANSITION}company_number`];

        const companyResult = await this.companyService.getCompanyProfile(tokens, company_number);

        const result = await this.limitedPartnershipService.createTransactionAndFirstSubmission(
          tokens,
          pageType,
          journeyTypes,
          this.mapCompanyProfileData(companyResult.companyProfile)
        );

        if (result.errors) {
          response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(pageRouting, { company: companyResult.companyProfile }, result.errors)
          );

          return;
        }

        const ids = { transactionId: result.transactionId, submissionId: result.submissionId };
        const url = super.insertIdsInUrl(pageRouting.nextUrl, ids);

        const cacheUpdated = this.cacheService.removeDataFromCache(
          request.signedCookies,
          `${APPLICATION_CACHE_KEY_PREFIX_TRANSITION}company_number`
        );
        response.cookie(APPLICATION_CACHE_KEY, cacheUpdated, cookieOptions);

        response.redirect(url);
      } catch (error) {
        next(error);
      }
    };
  }

  private mapCompanyProfileData(companyProfile: Partial<CompanyProfile>): Record<string, any> {
    const data = {
      partnership_name: companyProfile.companyName,
      partnership_type: PartnershipType.LP,
      jurisdiction: companyProfile.jurisdiction,
      partnership_number: companyProfile.companyNumber
    };

    const subtype = "private-fund-limited-partnership";

    if (
      (companyProfile.jurisdiction === Jurisdiction.ENGLAND_AND_WALES ||
        companyProfile.jurisdiction === Jurisdiction.NORTHERN_IRELAND) &&
      companyProfile.subtype === subtype
    ) {
      data.partnership_type = PartnershipType.PFLP;
    } else if (companyProfile.jurisdiction === Jurisdiction.SCOTLAND && !companyProfile.subtype) {
      data.partnership_type = PartnershipType.SLP;
    } else if (companyProfile.jurisdiction === Jurisdiction.SCOTLAND && companyProfile.subtype === subtype) {
      data.partnership_type = PartnershipType.SPFLP;
    }

    return data;
  }

  checkCompanyNumber() {
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
}

export default LimitedPartnershipController;
