import { NextFunction, Request, RequestHandler, Response } from "express";

import RegistrationService from "../../application/registration/Service";
import PageRegistrationType from "../../application/registration/PageRegistrationType";
import { PageRouting } from "../../domain/entities/PageRouting";

class RegistrationController {
  private registrationService: RegistrationService;

  constructor(registrationService: RegistrationService) {
    this.registrationService = registrationService;
  }

  getPageRouting(): RequestHandler {
    return (request: Request, response: Response, next: NextFunction) => {
      try {
        const pageType = this.pageType(request.path);

        const result = this.registrationService.getRegistrationRouting(
          pageType as PageRegistrationType
        );

        const pageRouting = this.inserIdInAllUrl(
          result,
          request.params.transactionId,
          request.params.submissionId
        );

        response.render(this.templateName(pageRouting.currentUrl), {
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
        const pageType = request.body.pageType;

        const result =
          await this.registrationService.createTransactionAndFirstSubmission(
            pageType,
            request.body
          );

        if (result?.errors?.length) {
          response.render(this.templateName(result.currentUrl), {
            props: result,
          });
          return;
        }

        const url = this.inserSubmissionId(
          this.inserTransactionId(result.nextUrl, result?.data?.transactionId),
          result?.data?.submissionId
        );

        response.redirect(url);
      } catch (error) {
        next(error);
      }
    };
  }

  private pageType(path: string) {
    const type = this.templateName(path);

    return type as PageRegistrationType;
  }

  private templateName(url: string): string {
    const splitted = url.split("/");
    return splitted[splitted.length - 1];
  }

  inserTransactionId(url: string, transactionId: string): string {
    return transactionId ? url.replace(":transactionId", transactionId) : url;
  }

  inserSubmissionId(url: string, submissionId: string): string {
    return submissionId ? url.replace(":submissionId", submissionId) : url;
  }

  private inserIdInAllUrl(
    pageRouting: PageRouting,
    transactionId: string,
    submissionId: string
  ): PageRouting {
    return {
      ...pageRouting,
      previousUrl: this.inserSubmissionId(
        this.inserTransactionId(pageRouting.previousUrl, transactionId),
        submissionId
      ),
      currentUrl: this.inserSubmissionId(
        this.inserTransactionId(pageRouting.currentUrl, transactionId),
        submissionId
      ),
      nextUrl: this.inserSubmissionId(
        this.inserTransactionId(pageRouting.nextUrl, transactionId),
        submissionId
      ),
    };
  }
}

export default RegistrationController;
