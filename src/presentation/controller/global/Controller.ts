import { NextFunction, Request, Response } from "express";

import globalsRouting from "./Routing";
import AbstractController from "../AbstractController";
import {
  ACCOUNTS_SIGN_OUT_URL,
  REGISTRATION_BASE_URL,
  APPLICATION_CACHE_KEY,
  cookieOptions,
  TRANSITION_BASE_URL,
  JOURNEY_TYPE_PARAM
} from "../../../config/constants";
import { CONFIRMATION_URL, PAYMENT_FAILED_URL } from "../../../presentation/controller/global/url";
import LimitedPartnershipService from "../../../application/service/LimitedPartnershipService";
import { getJourneyTypes } from "../../../utils";

class GlobalController extends AbstractController {
  constructor(private readonly limitedPartnershipService: LimitedPartnershipService) {
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

        const nextPageUrl = (status === "paid") ? CONFIRMATION_URL : PAYMENT_FAILED_URL;

        const nextPageUrlWithJourney = nextPageUrl.replace(
          JOURNEY_TYPE_PARAM,
          getJourneyTypes(request.url).journey
        );

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

  private clearCache(response: Response) {
    const clearCookieOptions = { ...cookieOptions, maxAge: undefined };
    return response.clearCookie(APPLICATION_CACHE_KEY, clearCookieOptions);
  }

  private redirectWithChecks(response: Response, url: string): void {
    if (url.startsWith(REGISTRATION_BASE_URL) || url.startsWith(TRANSITION_BASE_URL)) {
      return response.redirect(url);
    }
  }
}

export default GlobalController;
