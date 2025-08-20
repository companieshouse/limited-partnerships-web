import { NextFunction, Request, Response } from "express";

import globalsRouting from "./Routing";
import AbstractController from "../AbstractController";
import { Ids, Tokens } from "../../../domain/types";
import {
  ACCOUNTS_SIGN_OUT_URL,
  REGISTRATION_BASE_URL,
  APPLICATION_CACHE_KEY,
  cookieOptions,
  TRANSITION_BASE_URL,
  PAYMENTS_API_URL,
  CHS_URL,
  JOURNEY_TYPE_PARAM
} from "../../../config/constants";
import LimitedPartnershipService from "../../../application/service/LimitedPartnershipService";
import { getJourneyTypes, getLoggedInUserEmail, logger } from "../../../utils";
import PaymentService from "../../../application/service/PaymentService";
import { Journey } from "../../../domain/entities/journey";
import { CONFIRMATION_URL, PAYMENT_FAILED_URL, PAYMENT_RESPONSE_URL } from "./url";
import { WHICH_TYPE_WITH_IDS_URL } from "../registration/url";
import { EMAIL_URL } from "../transition/url";
import TransactionService from "../../../application/service/TransactionService";
import { TransactionKind, TransactionStatus } from "../../../domain/entities/TransactionTypes";
import GeneralPartnerService from "../../../application/service/GeneralPartnerService";
import CompanyService from "../../../application/service/CompanyService";
import { GeneralPartner, LimitedPartner } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";
import LimitedPartnerService from "../../../application/service/LimitedPartnerService";
import PostTransitionPageType from "../postTransition/pageType";

class GlobalController extends AbstractController {
  private static readonly FILING_MODE_URL_MAP: Record<string, { journey: string; resumeUrl: string }> = {
    [TransactionKind.registration]: {
      journey: Journey.registration,
      resumeUrl: WHICH_TYPE_WITH_IDS_URL
    },
    [TransactionKind.transition]: {
      journey: Journey.transition,
      resumeUrl: EMAIL_URL
    },
    [TransactionKind.postTransition]: {
      journey: "", // TODO: update when available
      resumeUrl: "" // TODO: update when available
    }
  };

  constructor(
    private readonly limitedPartnershipService: LimitedPartnershipService,
    private readonly paymentService: PaymentService,
    private readonly transactionService: TransactionService,
    private readonly companyService: CompanyService,
    private readonly generalPartnerService: GeneralPartnerService,
    private readonly limitedPartnerService: LimitedPartnerService
  ) {
    super();
  }

  getPageRouting() {
    return (request: Request, response: Response, next: NextFunction) => {
      try {
        const pageType = super.pageType(request.path);

        const pageRouting = super.getRouting(globalsRouting, pageType, request);

        response.render(super.templateName(pageRouting.currentUrl), {
          props: pageRouting
        });
      } catch (error) {
        next(error);
      }
    };
  }

  getSignOut() {
    return (request: Request, response: Response, next: NextFunction) => {
      try {
        const previousPageUrl = this.getPreviousPageUrl(request);
        const pageType = super.pageType(request.path);
        const pageRouting = super.getRouting(globalsRouting, pageType, request);
        pageRouting.previousUrl = previousPageUrl;
        response.render(super.templateName(pageRouting.currentUrl), {
          props: pageRouting
        });
      } catch (error) {
        next(error);
      }
    };
  }

  signOutChoice() {
    return (request: Request, response: Response, next: NextFunction) => {
      try {
        if (request.body["sign_out"] === "yes") {
          this.clearCache(response);
          return response.redirect(ACCOUNTS_SIGN_OUT_URL);
        }
        const previousPage = request.body["previousPage"];

        return this.redirectWithChecks(response, previousPage);
      } catch (error) {
        next(error);
      }
    };
  }

  getHealthcheck() {
    return (_request: Request, response: Response, next: NextFunction) => {
      try {
        response.status(200).json({ status: "OK" });
      } catch (error) {
        next(error);
      }
    };
  }

  getPaymentDecision() {
    return (request: Request, response: Response, next: NextFunction) => {
      try {
        const { status } = request.query;
        const { ids } = super.extract(request);

        const nextPageUrl = status === "paid" ? CONFIRMATION_URL : PAYMENT_FAILED_URL;

        const nextPageUrlWithJourney = nextPageUrl.replace(JOURNEY_TYPE_PARAM, getJourneyTypes(request.url).journey);

        const nextPageUrlWithJourneyAndIds = super.insertIdsInUrl(nextPageUrlWithJourney, ids);

        return response.redirect(nextPageUrlWithJourneyAndIds);
      } catch (error) {
        next(error);
      }
    };
  }

  getConfirmationPage() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, pageType, ids } = super.extract(request);
        const pageRouting = super.getRouting(globalsRouting, pageType, request);

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
          super.makeProps(pageRouting, { limitedPartnership, ids }, null)
        );
      } catch (error) {
        next(error);
      }
    };
  }

  getConfirmationPagePostTransition() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, pageType, ids } = super.extract(request);
        const pageRouting = super.getRouting(globalsRouting, pageType, request);
        const previousUrl = request.get("Referrer");

        const { generalPartner, limitedPartner } = await this.getPartnerDetails(tokens, ids.transactionId, previousUrl);

        const limitedPartnership = await this.getLimitedPartnershipDetails(tokens, ids.companyId);
        const userEmail = getLoggedInUserEmail(request.session);

        response.render(
          super.templateName(pageRouting.currentUrl),
          super.makeProps(pageRouting, { limitedPartnership, generalPartner, limitedPartner, userEmail, ids }, null)
        );
      } catch (error) {
        next(error);
      }
    };
  }

  private async getPartnerDetails(tokens: Tokens, transactionId: string, referrer: string | undefined): Promise<{generalPartner: GeneralPartner | undefined, limitedPartner: LimitedPartner | undefined}> {
    let generalPartner;
    let limitedPartner;

    const isGeneralPartnerReferrer = referrer?.includes(PostTransitionPageType.generalPartnerCheckYourAnswers);

    if (isGeneralPartnerReferrer) {
      const result = await this.generalPartnerService.getGeneralPartners(tokens, transactionId);
      generalPartner = result.generalPartners[0];
      generalPartner = {
        data: {
          forename: generalPartner.data?.forename,
          surname: generalPartner.data?.surname,
          legal_entity_name: generalPartner.data?.legal_entity_name
        }
      };
    } else {
      const result = await this.limitedPartnerService.getLimitedPartners(tokens, transactionId);
      limitedPartner = result.limitedPartners[0];
      limitedPartner = {
        data: {
          forename: limitedPartner.data?.forename,
          surname: limitedPartner.data?.surname,
          legal_entity_name: limitedPartner.data?.legal_entity_name
        }
      };
    };
    return { generalPartner, limitedPartner };
  }

  private async getLimitedPartnershipDetails(tokens: Tokens, companyId: string): Promise<Record<string, any>> {
    const result = await this.companyService.getCompanyProfile(tokens, companyId);

    return {
      data: {
        partnership_name: result.companyProfile.companyName,
        partnership_number: result.companyProfile.companyNumber
      }
    };
  }

  private clearCache(response: Response) {
    const clearCookieOptions = { ...cookieOptions, maxAge: undefined };
    return response.clearCookie(APPLICATION_CACHE_KEY, clearCookieOptions);
  }

  private redirectWithChecks(response: Response, url: string): void {
    if (url.startsWith(REGISTRATION_BASE_URL) || url.startsWith(TRANSITION_BASE_URL)) {
      return response.redirect(url);
    }
  }

  resumeJourney() {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, ids } = super.extract(request);
        logger.infoRequest(
          request,
          `Resuming journey for transaction: ${ids.transactionId}, submission: ${ids.submissionId}`
        );

        const transaction = await this.transactionService.getTransaction(tokens, ids.transactionId);

        if (!transaction?.filingMode || transaction.filingMode === "") {
          throw new Error("Transaction filing mode is undefined or empty when resuming journey");
        }

        const { journey, resumeUrl } = this.getFilingModeUrls(transaction.filingMode);

        if (this.isPendingPayment(transaction)) {
          return this.handlePendingPayment(response, tokens, ids, journey);
        }

        const resumePage = super.insertIdsInUrl(resumeUrl, { ...ids, companyId: transaction.companyNumber ?? "" });

        return response.redirect(resumePage);
      } catch (error) {
        next(error);
      }
    };
  }

  private isPendingPayment(transaction: any): boolean {
    return transaction.status === TransactionStatus.closedPendingPayment;
  }

  private async handlePendingPayment(response: Response, tokens: Tokens, ids: Ids, journey: string) {
    const startPaymentSessionUrl = PAYMENTS_API_URL + "/payments";
    const paymentReturnUrl = `${CHS_URL}${PAYMENT_RESPONSE_URL}`.replace(JOURNEY_TYPE_PARAM, journey);
    const paymentReturnUrlWithIds = super.insertIdsInUrl(paymentReturnUrl, ids);
    const redirectToPaymentServiceUrl = await this.paymentService.startPaymentSession(
      tokens,
      startPaymentSessionUrl,
      paymentReturnUrlWithIds,
      ids.transactionId
    );
    return response.redirect(redirectToPaymentServiceUrl);
  }

  private getFilingModeUrls(filingMode: string): { journey: string; resumeUrl: string } {
    const entry = GlobalController.FILING_MODE_URL_MAP[filingMode];
    if (!entry) {
      throw new Error(`Unknown transaction filing_mode '${filingMode}' found when resuming journey`);
    }
    return entry;
  }
}

export default GlobalController;
