import { NextFunction, Request, Response } from "express";
import escape from "escape-html";
import {
  GeneralPartner,
  LimitedPartner,
  LimitedPartnership,
  PartnershipType
} from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import LimitedPartnershipService from "../../../application/service/LimitedPartnershipService";
import PaymentService from "../../../application/service/PaymentService";
import registrationsRouting from "./Routing";
import AbstractController from "../AbstractController";
import RegistrationPageType from "./PageType";
import {
  APPLICATION_CACHE_KEY,
  APPLICATION_CACHE_KEY_PREFIX_REGISTRATION,
  CHS_URL,
  cookieOptions,
  JOURNEY_TYPE_PARAM
} from "../../../config/constants";
import CacheService from "../../../application/service/CacheService";
import { PageRouting } from "../PageRouting";
import { getJourneyTypes } from "../../../utils";
import {
  CHECK_YOUR_ANSWERS_URL,
  GENERAL_PARTNERS_URL,
  NAME_WITH_IDS_URL,
  REVIEW_GENERAL_PARTNERS_URL,
  WHICH_TYPE_WITH_IDS_URL
} from "./url";
import { CONFIRM_REGISTERED_OFFICE_ADDRESS_URL } from "../addressLookUp/url";
import { CONFIRMATION_URL } from "../global/url";
import GeneralPartnerService from "../../../application/service/GeneralPartnerService";
import LimitedPartnerService from "../../../application/service/LimitedPartnerService";

class LimitedPartnershipController extends AbstractController {
  constructor(
    private readonly limitedPartnershipService: LimitedPartnershipService,
    private readonly generalPartnerService: GeneralPartnerService,
    private readonly limitedPartnerService: LimitedPartnerService,
    private readonly cacheService: CacheService,
    private readonly paymentService: PaymentService
  ) {
    super();
  }

  getPageRouting() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, pageType, ids } = super.extract(request);
        const pageRouting = super.getRouting(registrationsRouting, pageType, request);

        this.conditionalPreviousUrl(ids, pageRouting, request);

        let limitedPartnership = {};
        let generalPartners: GeneralPartner[] = [];
        let limitedPartners: LimitedPartner[] = [];

        if (ids.transactionId && ids.submissionId) {
          limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
            tokens,
            ids.transactionId,
            ids.submissionId
          );
        }

        if (pageRouting.pageType === RegistrationPageType.checkYourAnswers) {
          generalPartners = await this.generalPartnerService.getGeneralPartners(tokens, ids.transactionId);

          limitedPartners = await this.limitedPartnerService.getLimitedPartners(tokens, ids.transactionId);
        }

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

  private conditionalPreviousUrl(
    ids: { transactionId: string; submissionId: string; generalPartnerId: string },
    pageRouting: PageRouting,
    request: Request
  ) {
    const previousPageType = super.pageType(request.get("Referrer") ?? "");

    if (previousPageType === RegistrationPageType.checkYourAnswers) {
      pageRouting.previousUrl = super.insertIdsInUrl(CHECK_YOUR_ANSWERS_URL, ids.transactionId, ids.submissionId);
    } else if (pageRouting.pageType === RegistrationPageType.name) {
      // change back link if we have ids in url
      if (ids.transactionId && ids.submissionId) {
        pageRouting.previousUrl = super.insertIdsInUrl(WHICH_TYPE_WITH_IDS_URL, ids.transactionId, ids.submissionId);
      }
    }
  }

  createTransactionAndFirstSubmission() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, RegistrationPageType);
        const pageRouting = super.getRouting(registrationsRouting, pageType, request);
        const journeyTypes = getJourneyTypes(pageRouting.currentUrl);

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

  closeTransaction() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, ids } = super.extract(request);
        const closeTransactionResponse = await this.limitedPartnershipService.closeTransaction(
          tokens,
          ids.transactionId
        );
        const startPaymentSessionUrl: string = closeTransactionResponse.headers?.["x-payment-required"];

        if (!startPaymentSessionUrl) {
          throw new Error("No payment URL found in response header from closeTransaction");
        }

        const urlWithJourney = `${CHS_URL}${CONFIRMATION_URL}`.replace(
          JOURNEY_TYPE_PARAM,
          getJourneyTypes(request.url).journey
        );

        const paymentReturnUri = super.insertIdsInUrl(urlWithJourney, ids.transactionId, ids.submissionId);

        const paymentRedirect = await this.paymentService.startPaymentSession(
          tokens,
          startPaymentSessionUrl,
          paymentReturnUri,
          ids.transactionId
        );

        if (!paymentRedirect) {
          throw new Error("No payment redirect URL returned from start payment session");
        }

        response.redirect(paymentRedirect);
      } catch (error) {
        next(error);
      }
    };
  }

  redirectWhichTypeWithIds() {
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

  redirectAndCacheSelection() {
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

  sendPageData() {
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

        await this.conditionalNextUrl(tokens, ids, pageRouting);

        response.redirect(pageRouting.nextUrl);
      } catch (error) {
        next(error);
      }
    };
  }

  private async conditionalNextUrl(
    tokens: { access_token: string; refresh_token: string },
    ids: { transactionId: string; submissionId: string },
    pageRouting: PageRouting
  ) {
    if (pageRouting.pageType === RegistrationPageType.email) {
      const limitedPartnership = await this.limitedPartnershipService.getLimitedPartnership(
        tokens,
        ids.transactionId,
        ids.submissionId
      );

      if (limitedPartnership.data?.registered_office_address) {
        pageRouting.nextUrl = super.insertIdsInUrl(
          CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
          ids.transactionId,
          ids.submissionId
        );
      }
    }
  }

  getPageRoutingTermSic() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, pageType, ids } = super.extract(request);
        const pageRouting = super.getRouting(registrationsRouting, pageType, request);

        this.conditionalPreviousUrl(ids, pageRouting, request);

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

  sendSicCodesPageData() {
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

        await this.conditionalSicCodeNextUrl(tokens, ids, pageRouting);

        response.redirect(pageRouting.nextUrl);
      } catch (error) {
        next(error);
      }
    };
  }

  private async conditionalSicCodeNextUrl(
    tokens: { access_token: string; refresh_token: string },
    ids: { transactionId: string; submissionId: string },
    pageRouting: PageRouting
  ) {
    const generalPartners = await this.generalPartnerService.getGeneralPartners(tokens, ids.transactionId);

    if (generalPartners.length > 0) {
      pageRouting.nextUrl = super.insertIdsInUrl(REVIEW_GENERAL_PARTNERS_URL, ids.transactionId, ids.submissionId);
    }
  }
}

export default LimitedPartnershipController;
