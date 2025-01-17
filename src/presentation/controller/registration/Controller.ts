import { NextFunction, Request, RequestHandler, Response } from "express";
import escape from "escape-html";
import { Session } from "@companieshouse/node-session-handler";

import RegistrationService from "../../../application/registration/Service";
import registrationsRouting from "./Routing";
import AbstractController from "../AbstractController";
import RegistrationPageType from "./PageType";
import {
  APPLICATION_CACHE_KEY_PREFIX_REGISTRATION,
  SUBMISSION_ID,
  TRANSACTION_ID
} from "../../../config/constants";
import CacheService from "../../../application/CacheService";

class RegistrationController extends AbstractController {
  private registrationService: RegistrationService;
  private cacheService: CacheService;

  constructor(
    registrationService: RegistrationService,
    cacheService: CacheService
  ) {
    super();
    this.registrationService = registrationService;
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
          request.url,
          transactionId,
          submissionId
        );

        let limitedPartnership = {};
        if (transactionId && submissionId) {
          limitedPartnership =
            await this.registrationService.getLimitedPartnership(
              tokens,
              transactionId,
              submissionId
            );
        }

        const cache = await this.cacheService.getDataFromCache(session);

        pageRouting.data = {
          ...pageRouting.data,
          limitedPartnership,
          cache
        };

        response.render(super.templateName(pageRouting.currentUrl), {
          props: { ...pageRouting }
        });
      } catch (error) {
        next(error);
      }
    };
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
          await this.registrationService.createTransactionAndFirstSubmission(
            tokens,
            pageType,
            request.body
          );

        const pageRouting = super.getRouting(
          registrationsRouting,
          pageType,
          request.url
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
          request.url,
          request.params[TRANSACTION_ID],
          request.params[SUBMISSION_ID]
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

        const result = await this.registrationService.sendPageData(
          tokens,
          transactionId,
          submissionId,
          pageType,
          request.body
        );

        const registrationRouting = super.getRouting(
          registrationsRouting,
          pageType,
          request.url,
          transactionId,
          submissionId
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
