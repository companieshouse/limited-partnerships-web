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
  TRANSACTION_ID,
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
        const pageType = super.pageType(request.path);
        const { transactionId, submissionId } = this.extractIds(request);

        const pageRouting = super.getRouting(
          registrationsRouting,
          pageType,
          request.url,
          transactionId,
          submissionId
        );

        const cache = await this.cacheService.getDataFromCache(session);

        pageRouting.data = {
          ...pageRouting.data,
          cache,
        };

        response.render(super.templateName(pageRouting.currentUrl), {
          props: { ...pageRouting },
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
        const access_token = this.extractAccessToken(request);
        const pageType = this.extractPageTypeOrThrowError(request);

        const result =
          await this.registrationService.createTransactionAndFirstSubmission(
            { access_token },
            pageType,
            request.body
          );

        const registrationRouting = super.getRouting(
          registrationsRouting,
          pageType,
          request.url
        );

        if (result.errors?.length) {
          response.render(super.templateName(registrationRouting.currentUrl), {
            props: result,
          });
          return;
        }

        const url = super.insertIdsInUrl(
          registrationRouting.nextUrl,
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
        const type = this.extractPageTypeOrThrowError(request);

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
          [`${APPLICATION_CACHE_KEY_PREFIX_REGISTRATION}${pageType}`]:
            parameter,
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
        const access_token = this.extractAccessToken(request);
        const pageType = this.extractPageTypeOrThrowError(request);
        const { transactionId, submissionId } = this.extractIds(request);

        const result = await this.registrationService.sendPageData(
          { access_token },
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

        if (result?.errors?.length) {
          response.render(super.templateName(registrationRouting.currentUrl), {
            props: result,
          });
          return;
        }

        response.redirect(registrationRouting.nextUrl);
      } catch (error) {
        next(error);
      }
    };
  }

  private extractPageTypeOrThrowError(request) {
    const pageTypeList = Object.values(RegistrationPageType);
    const pageType = request.body.pageType;

    if (!pageTypeList.includes(pageType)) {
      throw new Error(`wrong page type: ${pageType}`);
    }
    return pageType;
  }

  private extractAccessToken(request) {
    return (
      request?.session?.data?.signin_info?.access_token?.access_token ?? ""
    );
  }

  private extractIds(request) {
    const transactionId = request.params.transactionId;
    const submissionId = request.params.submissionId;

    return { transactionId, submissionId };
  }
}

export default RegistrationController;
