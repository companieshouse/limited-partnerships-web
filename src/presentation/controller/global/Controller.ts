import { NextFunction, Request, Response } from "express";

import globalsRouting from "./Routing";
import AbstractController from "../AbstractController";
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
import { logger } from "../../../utils";
import PaymentService from "../../../application/service/PaymentService";
import { Journey } from "../../../domain/entities/journey";
import { CONFIRMATION_URL } from "./url";
import { WHICH_TYPE_WITH_IDS_URL } from "../registration/url";
import { COMPANY_NUMBER_URL } from "../transition/url";
import TransactionService from "../../../application/service/TransactionService";

class GlobalController extends AbstractController {
  constructor(
    private readonly limitedPartnershipService: LimitedPartnershipService,
    private readonly paymentService: PaymentService,
    private readonly transactionService: TransactionService
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
        logger.infoRequest(request, `Resuming journey for transaction: ${ids.transactionId}, submission: ${ids.submissionId}`);

        const transaction = await this.transactionService.getTransaction(tokens, ids.transactionId);

        if (!transaction?.filingMode) {
          logger.errorRequest(request, "Transaction filing mode is undefined when resuming journey");
          return next(new Error("Transaction filing mode is undefined when resuming journey"));
        }

        if (this.isPendingPayment(transaction)) {
          return this.handlePendingPayment(request, response, tokens, ids, transaction);
        }

        return this.redirectToResumePage(response, transaction.filingMode, ids);

      } catch (error) {
        logger.errorRequest(request, `Error in resumeJourney: ${error.message}`);
        next(error);
      }
    };
  }

  private isPendingPayment(transaction: any): boolean {
    return transaction.status === "closed pending payment";
  }

  private async handlePendingPayment(
    request: Request,
    response: Response,
    tokens: any,
    ids: any,
    transaction: any
  ) {
    const startPaymentSessionUrl = PAYMENTS_API_URL + "/payments";
    const paymentReturnUrl = `${CHS_URL}${CONFIRMATION_URL}`.replace(JOURNEY_TYPE_PARAM, this.getJourneyUrl(transaction.filingMode));
    const paymentReturnUrlWithIds = super.insertIdsInUrl(paymentReturnUrl, ids);
    const redirectToPaymentServiceUrl = await this.paymentService.startPaymentSession(
      tokens,
      startPaymentSessionUrl,
      paymentReturnUrlWithIds,
      ids.transactionId
    );
    logger.infoRequest(request, `Payments session started on resume link with transaction: ${ids.transactionId}, submission: ${ids.submissionId}`);
    return response.redirect(redirectToPaymentServiceUrl);
  }

  private redirectToResumePage(response: Response, filingMode: string, ids: any) {
    const resumePage = super.insertIdsInUrl(this.getResumeUrl(filingMode), ids);
    return response.redirect(resumePage);
  }

  private static readonly FILING_MODE_URL_MAP: Record<string, { journey: string; resumeUrl: string }> = {
    "limited-partnership-registration": {
      journey: Journey.registration,
      resumeUrl: WHICH_TYPE_WITH_IDS_URL
    },
    "limited-partnership-transition": {
      journey: Journey.transition,
      resumeUrl: COMPANY_NUMBER_URL // TODO: change to email url
    },
    "limited-partnership-post-transition": {
      journey: "", // TODO: update when available
      resumeUrl: "" // TODO: update when available
    }
  };

  private getJourneyUrl(filingMode: string): string {
    const entry = GlobalController.FILING_MODE_URL_MAP[filingMode];
    if (!entry) {
      throw new Error(`Unknown transaction filing_mode '${filingMode}' found when resuming payment journey`);
    }
    return entry.journey;
  }

  private getResumeUrl(filingMode: string): string {
    const entry = GlobalController.FILING_MODE_URL_MAP[filingMode];
    if (!entry) {
      throw new Error(`Unknown transaction filing_mode '${filingMode}' found when resuming journey`);
    }
    return entry.resumeUrl;
  }
}

export default GlobalController;
