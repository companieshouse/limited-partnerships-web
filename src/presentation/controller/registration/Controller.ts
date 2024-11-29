import { NextFunction, Request, RequestHandler, Response } from "express";

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
        const transactionId = request.params.transactionId;
        const submissionId = request.params.submissionId;

        const pageRouting = super.getRouting(
          registrationsRouting,
          pageType,
          transactionId,
          submissionId
        );

        response.render(super.templateName(pageRouting.currentUrl), {
          props: pageRouting,
        });
      } catch (error) {
        next(error);
      }
    };
  }

  createTransactionAndFirstSubmission(): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const access_token =
          request?.session?.data?.signin_info?.access_token?.access_token ?? "";
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

        const { pageType, parameter } = request.body;

        response.redirect(`${url}?${pageType}=${parameter}`);
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
}

export default RegistrationController;
