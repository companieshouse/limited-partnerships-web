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
import { GeneralPartner, Jurisdiction, LimitedPartner, PartnershipType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { PageRouting } from "../PageRouting";
import { CONFIRM_REGISTERED_OFFICE_ADDRESS_URL } from "../addressLookUp/url/transition";
import GeneralPartnerService from "../../../application/service/GeneralPartnerService";
import LimitedPartnerService from "../../../application/service/LimitedPartnerService";
import { formatDate } from "../../../utils/date-format";

class LimitedPartnershipController extends AbstractController {
  constructor(
    private readonly companyService: CompanyService,
    private readonly cacheService: CacheService,
    private readonly limitedPartnershipService: LimitedPartnershipService,
    private readonly generalPartnerService: GeneralPartnerService,
    private readonly limitedPartnerService: LimitedPartnerService
  ) {
    super();
  }

  getPageRouting() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, pageType, ids } = super.extract(request);
        const pageRouting = super.getRouting(transitionRouting, pageType, request);

        let limitedPartnership = {};

        if (ids.transactionId && ids.submissionId) {
          limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
            tokens,
            ids.transactionId,
            ids.submissionId
          );
        }

        const { generalPartners, limitedPartners } = await this.getPartners(pageRouting, tokens, ids.transactionId, response);

        const cache = this.cacheService.getDataFromCache(request.signedCookies);

        response.render(
          super.templateName(pageRouting.currentUrl),
          super.makeProps(pageRouting, { limitedPartnership, generalPartners, limitedPartners, cache, ids }, null)
        );
      } catch (error) {
        next(error);
      }
    };
  }

  private async getPartners(
    pageRouting: PageRouting,
    tokens: { access_token: string; refresh_token: string },
    transactionId: string,
    response: Response
  ): Promise<{ generalPartners: GeneralPartner[]; limitedPartners: LimitedPartner[] } > {
    if (pageRouting.pageType === TransitionPageType.checkYourAnswers) {
      const gpResult = await this.generalPartnerService.getGeneralPartners(tokens, transactionId);
      const generalPartners = gpResult.generalPartners.map((partner) => ({
        ...partner,
        data: {
          ...partner.data,
          date_of_birth: partner.data?.date_of_birth
            ? formatDate(partner.data?.date_of_birth, response.locals.i18n)
            : undefined,
          date_effective_from: partner.data?.date_effective_from
            ? formatDate(partner.data?.date_effective_from, response.locals.i18n)
            : undefined
        }
      }));

      const lpResult = await this.limitedPartnerService.getLimitedPartners(tokens, transactionId);
      const limitedPartners = lpResult.limitedPartners.map((partner) => ({
        ...partner,
        data: {
          ...partner.data,
          date_of_birth: partner.data?.date_of_birth
            ? formatDate(partner.data?.date_of_birth, response.locals.i18n)
            : undefined,
          date_effective_from: partner.data?.date_effective_from
            ? formatDate(partner.data?.date_effective_from, response.locals.i18n)
            : undefined
        }
      }));
      return { generalPartners, limitedPartners };
    }
    return { generalPartners: [], limitedPartners: [] };
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
        const url = super.insertIdsInUrl(pageRouting.nextUrl, ids, request.url);

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

  sendPageData() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, ids } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, TransitionPageType);
        const pageRouting = super.getRouting(transitionRouting, pageType, request);

        const result = await this.limitedPartnershipService.sendPageData(
          tokens,
          ids.transactionId,
          ids.submissionId,
          pageType,
          request.body
        );

        if (result?.errors) {
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
                limitedPartnership: {
                  ...limitedPartnership,
                  data: {
                    ...limitedPartnership.data,
                    email: request.body.email
                  }
                }
              },
              result.errors
            )
          );
          return;
        }

        await this.conditionalNextUrl(tokens, ids, pageRouting, request);

        response.redirect(pageRouting.nextUrl);
      } catch (error) {
        next(error);
      }
    };
  }

  private async conditionalNextUrl(
    tokens: { access_token: string; refresh_token: string },
    ids: { transactionId: string; submissionId: string },
    pageRouting: PageRouting,
    request: Request
  ) {
    if (pageRouting.pageType === TransitionPageType.email) {
      const limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
        tokens,
        ids.transactionId,
        ids.submissionId
      );

      if (limitedPartnership.data?.registered_office_address) {
        pageRouting.nextUrl = super.insertIdsInUrl(CONFIRM_REGISTERED_OFFICE_ADDRESS_URL, ids, request.url);
      }
    }
  }
}

export default LimitedPartnershipController;
