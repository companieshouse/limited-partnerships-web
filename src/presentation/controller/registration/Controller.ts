import { NextFunction, Request, RequestHandler, Response } from "express";
import escape from "escape-html";

import RegistrationService from "../../../application/registration/Service";
import registrationsRouting from "./Routing";
import AbstractController from "../AbstractController";
import PageType from "./PageType";

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

        response.render(super.templateName(pageRouting.currentUrl), {
          props: { ...pageRouting, parameters },
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

        const result =
          await this.registrationService.createTransactionAndFirstSubmission(
            { access_token },
            pageType,
            request.body
          );

        const registrationRouting = super.getRouting(
          registrationsRouting,
          pageType
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

        response.redirect(url);
      } catch (error) {
        next(error);
      }
    };
  }

  redirectWithParameter(): RequestHandler {
    return (request: Request, response: Response, next: NextFunction) => {
      try {
        const type = this.extractPageTypeOrThrowError(request);

        const registrationRouting = super.getRouting(
          registrationsRouting,
          type
        );

        const url = super.insertIdsInUrl(registrationRouting.nextUrl);

        const pageType = escape(request.body.pageType);
        const parameter = escape(request.body.parameter);

        response.redirect(`${url}?${pageType}=${parameter}`);
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

        response.redirect(registrationRouting.nextUrl);
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
