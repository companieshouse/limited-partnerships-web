import { NextFunction, Request, RequestHandler, Response } from "express";
import escape from "escape-html";

import RegistrationService from "../../../application/registration/Service";
import registrationsRouting from "./Routing";
import AbstractController from "../AbstractController";
import PageType from "./PageType";
import addLangToUrls from "../../../utils/queryParams";

class RegistrationController extends AbstractController {
  private registrationService: RegistrationService;

  constructor(registrationService: RegistrationService) {
    super();
    this.registrationService = registrationService;
  }

  getPageRouting(): RequestHandler {
    return (request: Request, response: Response, next: NextFunction) => {
      try {
        const pageType = super.pageType(request.path);
        const { transactionId, submissionId } = this.extractIds(request);

        const pageRouting = super.getRouting(
          registrationsRouting,
          pageType,
          transactionId,
          submissionId
        );

        const parameters = request.query;

        const pageRoutingWithQueryParams = addLangToUrls(request, pageRouting, response.locals);

        response.render(super.templateName(pageRoutingWithQueryParams.currentUrl), {
          props: { ...pageRouting, ...pageRoutingWithQueryParams, parameters },
          ...response.locals,
          currentUrl: pageRoutingWithQueryParams.currentUrl,
        });
      } catch (error) {
        next(error);
      }
    };
  }

  createTransactionAndFirstSubmission(): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const access_token = this.extractAccessToken(request);
        const pageType = this.extractPageTypeOrThrowError(request);
        const { transactionId, submissionId } = this.extractIds(request);

        const result =
          await this.registrationService.createTransactionAndFirstSubmission(
            { access_token },
            pageType,
            request.body
          );

        const registrationRouting = super.getRouting(
          registrationsRouting,
          pageType,
          transactionId,
          submissionId
        );

        if (result.errors?.length) {
          response.render(super.templateName(registrationRouting.currentUrl), {
            props: result,
          });
          return;
        }

        registrationRouting.nextUrl = super.insertIdsInUrl(
          registrationRouting.nextUrl,
          result.transactionId,
          result.submissionId
        );

        const pageRoutingWithQueryParams = addLangToUrls(request, registrationRouting, response.locals);

        response.redirect(pageRoutingWithQueryParams.nextUrl);
      } catch (error) {
        next(error);
      }
    };
  }

  redirectWithParameter(): RequestHandler {
    return (request: Request, response: Response, next: NextFunction) => {
      try {
        console.log("TYPE", request.body.pageType);
        const type = this.extractPageTypeOrThrowError(request);
        const { transactionId, submissionId } = this.extractIds(request);

        const registrationRouting = super.getRouting(
          registrationsRouting,
          type,
          transactionId,
          submissionId
        );

        const pageType = escape(request.body.pageType);
        const parameter = escape(request.body.parameter);

        registrationRouting.nextUrl = `${registrationRouting.nextUrl}?${pageType}=${parameter}`;

        const pageRoutingWithQueryParams = addLangToUrls(request, registrationRouting, response.locals);

        response.redirect(pageRoutingWithQueryParams.nextUrl);
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
          transactionId,
          submissionId
        );

        if (result?.errors?.length) {
          response.render(super.templateName(registrationRouting.currentUrl), {
            props: result,
          });
          return;
        }

        const pageRoutingWithQueryParams = addLangToUrls(request, registrationRouting, response.locals);

        response.redirect(pageRoutingWithQueryParams.nextUrl);
      } catch (error) {
        next(error);
      }
    };
  }

  private extractPageTypeOrThrowError(request) {
    const pageTypeList = Object.values(PageType);
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
