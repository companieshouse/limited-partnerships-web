import { NextFunction, Request, Response } from "express";
import AbstractController from "../AbstractController";
import { Ids, Tokens } from "../../../domain/types";
import transitionRouting from "./Routing";
import TransitionPageType from "./PageType";
import CompanyService from "../../../application/service/CompanyService";
import CacheService from "../../../application/service/CacheService";
import LimitedPartnershipService from "../../../application/service/LimitedPartnershipService";
import { JOURNEY_TYPE_PARAM } from "../../../config/constants";
import { getJourneyTypes } from "../../../utils/journey";
import { GeneralPartner, LimitedPartner } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import { PageRouting } from "../PageRouting";
import { CONFIRM_REGISTERED_OFFICE_ADDRESS_URL } from "../addressLookUp/url/transition";
import GeneralPartnerService from "../../../application/service/GeneralPartnerService";
import LimitedPartnerService from "../../../application/service/LimitedPartnerService";
import { formatDate } from "../../../utils/date-format";
import { CONFIRMATION_URL } from "../global/url";

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

        const { generalPartners, limitedPartners } = await this.getPartners(
          pageRouting,
          tokens,
          ids.transactionId,
          response
        );

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
    tokens: Tokens,
    transactionId: string,
    response: Response
  ): Promise<{ generalPartners: GeneralPartner[]; limitedPartners: LimitedPartner[] }> {
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
        const { ids, pageType } = super.extract(request);
        const pageRouting = super.getRouting(transitionRouting, pageType, request);

        const result = await this.companyService.buildLimitedPartnershipFromCompanyProfile(tokens, ids.companyId);

        if (result.errors) {
          response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(pageRouting, null, result.errors)
          );

          return;
        }

        response.render(
          super.templateName(pageRouting.currentUrl),
          super.makeProps(pageRouting, { limitedPartnership: result.limitedPartnership }, null)
        );
      } catch (error) {
        next(error);
      }
    };
  }

  limitedPartnershipConfirm() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { ids, pageType, tokens } = super.extract(request);
        const pageRouting = super.getRouting(transitionRouting, pageType, request);
        const journeyTypes = getJourneyTypes(pageRouting.currentUrl);
        const { limitedPartnership } = await this.companyService.buildLimitedPartnershipFromCompanyProfile(
          tokens,
          ids.companyId
        );

        const result = await this.limitedPartnershipService.createTransactionAndFirstSubmission(
          tokens,
          pageType,
          journeyTypes,
          {
            partnership_name: limitedPartnership.data?.partnership_name,
            partnership_type: limitedPartnership.data?.partnership_type,
            jurisdiction: limitedPartnership.data?.jurisdiction,
            partnership_number: limitedPartnership.data?.partnership_number
          },
          {
            companyName: limitedPartnership.data?.partnership_name ?? "",
            companyNumber: limitedPartnership.data?.partnership_number ?? ""
          }
        );
        if (result.errors) {
          response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(pageRouting, { limitedPartnership }, result.errors)
          );

          return;
        }

        const newIds = {
          companyId: limitedPartnership.data?.partnership_number,
          transactionId: result.transactionId,
          submissionId: result.submissionId
        } as Ids;
        const url = super.insertIdsInUrl(pageRouting.nextUrl, newIds, request.url);

        response.redirect(url);
      } catch (error) {
        next(error);
      }
    };
  }

  checkCompanyNumber() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { ids, tokens } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, TransitionPageType);
        const pageRouting = super.getRouting(transitionRouting, pageType, request);
        const { company_number } = request.body;

        const result = await this.companyService.buildLimitedPartnershipFromCompanyProfile(tokens, company_number);

        if (result.errors) {
          response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(pageRouting, { company_number }, result.errors)
          );

          return;
        }

        const url = super.insertIdsInUrl(pageRouting.nextUrl, { ...ids, companyId: company_number }, request.url);

        response.redirect(url);
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

  private async conditionalNextUrl(tokens: Tokens, ids: Ids, pageRouting: PageRouting, request: Request) {
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

  postCheckYourAnswers() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, ids } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, TransitionPageType);

        await this.limitedPartnershipService.sendPageData(
          tokens,
          ids.transactionId,
          ids.submissionId,
          pageType,
          request.body
        );

        await this.limitedPartnershipService.closeTransaction(tokens, ids.transactionId);

        const url = super
          .insertIdsInUrl(CONFIRMATION_URL, ids, request.url)
          .replace(JOURNEY_TYPE_PARAM, getJourneyTypes(request.url).journey);

        response.redirect(url);
      } catch (error) {
        next(error);
      }
    };
  }
}

export default LimitedPartnershipController;
