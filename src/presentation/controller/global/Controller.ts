import { NextFunction, Request, Response } from "express";

import globalsRouting, { RESUME_REGISTRATION_OR_TRANSITION_URL_MAP } from "./Routing";
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
import { CONFIRMATION_URL, PAYMENT_FAILED_URL, PAYMENT_RESPONSE_URL, CONFIRMATION_POST_TRANSITION_URL } from "./url";
import TransactionService from "../../../application/service/TransactionService";
import { TransactionStatus } from "../../../domain/entities/TransactionTypes";
import GeneralPartnerService from "../../../application/service/GeneralPartnerService";
import CompanyService from "../../../application/service/CompanyService";
import { GeneralPartner, LimitedPartner } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";
import LimitedPartnerService from "../../../application/service/LimitedPartnerService";
import PostTransitionPageType from "../postTransition/pageType";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";

class GlobalController extends AbstractController {

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
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { status } = request.query;
        const { tokens, ids } = super.extract(request);

        const journeyTypes = getJourneyTypes(request.url);
        const confirmationUrl = journeyTypes.isPostTransition ? CONFIRMATION_POST_TRANSITION_URL : CONFIRMATION_URL;
        const nextPageUrl = status === "paid" ? confirmationUrl : PAYMENT_FAILED_URL;

        const nextPageUrlWithJourney = nextPageUrl.replace(JOURNEY_TYPE_PARAM, journeyTypes.journey);

        if (status === "paid" && !ids.companyId) {
          const transaction = await this.transactionService.getTransaction(tokens, ids.transactionId);
          if (transaction.companyNumber) {
            ids.companyId = transaction.companyNumber;
          }
        }
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

        const transaction = await this.transactionService.getTransaction(tokens, ids.transactionId);

        const subtype = Object.values(transaction?.resources ?? {})[0]?.kind;

        response.render(
          super.templateName(pageRouting.currentUrl),
          super.makeProps(pageRouting, { limitedPartnership, generalPartner, limitedPartner, userEmail, ids, subtype }, null)
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
    } else {
      const result = await this.limitedPartnerService.getLimitedPartners(tokens, transactionId);
      limitedPartner = result.limitedPartners[0];
    };
    return { generalPartner, limitedPartner };
  }

  private async getLimitedPartnershipDetails(tokens: Tokens, companyId: string): Promise<Record<string, any>> {
    const result = await this.companyService.buildLimitedPartnershipFromCompanyProfile(tokens, companyId);
    return result.limitedPartnership;
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

  // resumeJourneyRegistrationOrTransition() {
  //   return async (request: Request, response: Response, next: NextFunction) => {
  //     try {
  //       const { tokens, ids } = super.extract(request);
  //       logger.infoRequest(
  //         request,
  //         `Resuming journey for transaction: ${ids.transactionId}`
  //       );

  //       const transaction = await this.transactionService.getTransaction(tokens, ids.transactionId);

  //       if (!transaction?.filingMode || transaction.filingMode === "") {
  //         throw new Error("Transaction filing mode is undefined or empty when resuming journey");
  //       }

  //       const { journey, resumeUrl } = this.getFilingModeUrls(transaction.filingMode);

  //       if (this.isPendingPayment(transaction)) {
  //         return this.handlePendingPayment(response, tokens, ids, journey);
  //       }

  //       const resumePage = super.insertIdsInUrl(resumeUrl, { ...ids, companyId: transaction.companyNumber ?? "" });

  //       return response.redirect(resumePage);
  //     } catch (error) {
  //       next(error);
  //     }
  //   };
  // }

  // resumeJourneyPostTransition(map: Record<string, { journey: string; resumeUrl: string }> ) {
  //   return async (request: Request, response: Response, next: NextFunction) => {
  //     try {
  //       const { tokens, ids } = super.extract(request);
  //       logger.infoRequest(
  //         request,
  //         `Resuming journey for transaction: ${ids.transactionId}`
  //       );

  //       const transaction = await this.transactionService.getTransaction(tokens, ids.transactionId);

  //       if (!transaction.resources || Object.keys(transaction.resources).length === 0) {
  //         throw new Error("Transaction resources are undefined or empty when resuming post transition journey");
  //       }

  //       const resource = Object.values(transaction.resources)[0];
  //       if (!map[resource.kind]) {
  //         throw new Error(`Unknown transaction resource kind '${resource.kind}' found when resuming post transition journey`);
  //       }

  //       const { journey, resumeUrl } = map[resource.kind];

  //       if (this.isPendingPayment(transaction)) {
  //         return this.handlePendingPayment(response, tokens, ids, journey);
  //       }

  //       const resumePage = super.insertIdsInUrl(resumeUrl, { ...ids, companyId: transaction.companyNumber ?? "" });

  //       return response.redirect(resumePage);
  //     } catch (error) {
  //       next(error);
  //     }
  //   };
  // }

  resumeJourneyRegistrationOrTransition() {
    return (request: Request, response: Response, next: NextFunction) => {
      this.handleResumeJourney(request, response, next, (transaction: Transaction) => {
        if (!transaction?.filingMode || transaction.filingMode === "") {
          throw new Error("Transaction filing mode is undefined or empty when resuming journey");
        }
        const resumeData = RESUME_REGISTRATION_OR_TRANSITION_URL_MAP[transaction.filingMode];
        if (!resumeData) {
          throw new Error(`Unknown transaction filing_mode '${transaction.filingMode}' found when resuming journey`);
        }
        return resumeData;
      });
    };
  }

  resumeJourneyPostTransition(resumeUrlMap: Record<string, { journey: string; resumeUrl: string }>) {
    return (request: Request, response: Response, next: NextFunction) => {
      this.handleResumeJourney(request, response, next, (transaction: Transaction) => {
        if (!transaction.resources || Object.keys(transaction.resources).length === 0) {
          throw new Error("Transaction resources are undefined or empty when resuming post transition journey");
        }
        const resource = Object.values(transaction.resources)[0];
        const resumeData = resumeUrlMap[resource.kind];
        if (!resumeData) {
          throw new Error(`Unknown transaction resource kind '${resource.kind}' found when resuming post transition journey`);
        }
        return resumeData;
      });
    };
  }

  private async handleResumeJourney(
    request: Request,
    response: Response,
    next: NextFunction,
    getJourneyAndUrl: (transaction: any) => { journey: string; resumeUrl: string }
  ) {
    try {
      const { tokens, ids } = super.extract(request);
      logger.infoRequest(request, `Resuming journey for transaction: ${ids.transactionId}`);

      const transaction = await this.transactionService.getTransaction(tokens, ids.transactionId);

      const { journey, resumeUrl } = getJourneyAndUrl(transaction);

      if (this.isPendingPayment(transaction)) {
        return this.handlePendingPayment(response, tokens, ids, journey);
      }

      const resumePage = super.insertIdsInUrl(resumeUrl, { ...ids, companyId: transaction.companyNumber ?? "" });
      return response.redirect(resumePage);
    } catch (error) {
      next(error);
    }
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
}

export default GlobalController;
