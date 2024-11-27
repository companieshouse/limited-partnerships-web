import { NextFunction, Request, RequestHandler, Response } from "express";

import RegistrationService from "../../../application/registration/Service";
import registrationsRouting from "./Routing";
import AbstractController from "../AbstractController";

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
        const pageType = request.body.pageType;

        const result =
          await this.registrationService.createTransactionAndFirstSubmission(
            access_token as string,
            pageType,
            request.body
          );

        const registrationRouting = super.getRouting(
          registrationsRouting,
          pageType
        );

        if (result?.errors?.length) {
          response.render(super.templateName(registrationRouting.currentUrl), {
            props: result,
          });
          return;
        }

        const url = super.insertIdsInUrl(
          registrationRouting.nextUrl,
          result?.transactionId,
          result?.submissionId
        );

        response.redirect(url);
      } catch (error) {
        next(error);
      }
    };
  }
}

export default RegistrationController;
