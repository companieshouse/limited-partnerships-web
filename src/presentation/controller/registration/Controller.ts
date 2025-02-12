import { NextFunction, Request, RequestHandler, Response } from "express";
import escape from "escape-html";
import { Session } from "@companieshouse/node-session-handler";
import {
  LimitedPartnership,
  PartnershipType
} from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";

import LimitedPartnershipService from "../../../application/service/LimitedPartnershipService";
import registrationsRouting from "./Routing";
import AbstractController from "../AbstractController";
import RegistrationPageType from "./PageType";
import { APPLICATION_CACHE_KEY_PREFIX_REGISTRATION } from "../../../config/constants";
import CacheService from "../../../application/service/CacheService";
import PageType from "../PageType";
import { GENERAL_PARTNERS_URL } from "./url";

class RegistrationController extends AbstractController {
  private limitedPartnershipService: LimitedPartnershipService;
  private cacheService: CacheService;

  constructor(
    limitedPartnershipService: LimitedPartnershipService,
    cacheService: CacheService
  ) {
    super();
    this.limitedPartnershipService = limitedPartnershipService;
    this.cacheService = cacheService;
  }

  getPageRouting(): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const session = request.session as Session;
        const tokens = super.extractTokens(request);
        const pageType = super.pageType(request.path);
        const { transactionId, submissionId } = super.extractIds(request);

        const pageRouting = super.getRouting(
          registrationsRouting,
          pageType,
          request
        );

        let limitedPartnership = {};
        const generalPartner = {};
        const limitedPartner = {};

        if (transactionId && submissionId) {
          limitedPartnership =
            await this.limitedPartnershipService.getLimitedPartnership(
              tokens,
              transactionId,
              submissionId
            );
        }

        const cache = await this.cacheService.getDataFromCache(session);

        pageRouting.data = {
          ...pageRouting.data,
          limitedPartnership,
          generalPartner,
          limitedPartner,
          cache
        };

        const redirect = this.conditionalRedirecting(
          request,
          response,
          pageType,
          limitedPartnership
        );

        if (!redirect) {
          response.render(super.templateName(pageRouting.currentUrl), {
            props: { ...pageRouting }
          });
        }
      } catch (error) {
        next(error);
      }
    };
  }

  conditionalRedirecting(
    request: Request,
    response: Response,
    pageType: PageType,
    limitedPartnership: LimitedPartnership
  ): boolean {
    let redirect = false;

    // Redirect to general partners page if partnership type is PFLP or SPFLP instead of term page
    if (
      pageType === RegistrationPageType.term &&
      (limitedPartnership.data?.partnership_type === PartnershipType.PFLP ||
        limitedPartnership.data?.partnership_type === PartnershipType.SPFLP)
    ) {
      const { transactionId, submissionId } = super.extractIds(request);

      const url = super.insertIdsInUrl(
        GENERAL_PARTNERS_URL,
        transactionId,
        submissionId
      );

      response.redirect(url);

      redirect = true;
    }

    return redirect;
  }

  createTransactionAndFirstSubmission(): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const session = request.session as Session;
        const tokens = super.extractTokens(request);
        const pageType = super.extractPageTypeOrThrowError(
          request,
          RegistrationPageType
        );

        const result =
          await this.limitedPartnershipService.createTransactionAndFirstSubmission(
            tokens,
            pageType,
            request.body
          );

        const pageRouting = super.getRouting(
          registrationsRouting,
          pageType,
          request
        );

        if (result.errors) {
          const cache = await this.cacheService.getDataFromCache(session);

          pageRouting.data = {
            ...pageRouting.data,
            limitedPartnership: { data: request.body },
            cache
          };

          pageRouting.errors = result.errors?.errors;

          response.render(super.templateName(pageRouting.currentUrl), {
            props: { ...result, ...pageRouting }
          });

          return;
        }

        const url = super.insertIdsInUrl(
          pageRouting.nextUrl,
          result.transactionId,
          result.submissionId
        );

        await this.cacheService.removeDataFromCache(
          session,
          `${APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}${RegistrationPageType.whichType}`
        );

        response.redirect(url);
      } catch (error) {
        next(error);
      }
    };
  }

  redirectAndCacheSelection(): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const session = request.session as Session;
        const type = super.extractPageTypeOrThrowError(
          request,
          RegistrationPageType
        );

        const registrationRouting = super.getRouting(
          registrationsRouting,
          type,
          request
        );

        const pageType = escape(request.body.pageType);
        const parameter = escape(request.body.parameter);

        await this.cacheService.addDataToCache(session, {
          [`${APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}${pageType}`]: parameter
        });

        response.redirect(registrationRouting.nextUrl);
      } catch (error) {
        next(error);
      }
    };
  }

  sendPageData(): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const tokens = super.extractTokens(request);
        const pageType = super.extractPageTypeOrThrowError(
          request,
          RegistrationPageType
        );
        const { transactionId, submissionId } = super.extractIds(request);

        const result = await this.limitedPartnershipService.sendPageData(
          tokens,
          transactionId,
          submissionId,
          pageType,
          request.body
        );

        const registrationRouting = super.getRouting(
          registrationsRouting,
          pageType,
          request
        );

        if (result?.errors) {
          registrationRouting.errors = result.errors?.errors;

          response.render(super.templateName(registrationRouting.currentUrl), {
            props: { ...result, ...registrationRouting }
          });
          return;
        }

        response.redirect(registrationRouting.nextUrl);
      } catch (error) {
        next(error);
      }
    };
  }
}

export default RegistrationController;
