import { NextFunction, Request, RequestHandler, Response } from "express";

import RegistrationService from "../../application/registration/Service";
import TransactionRegistrationType from "../../application/registration/TransactionRegistrationType";
import { TransactionRouting } from "../../domain/entities/TransactionRouting";

class RegistrationController {
  private registrationService: RegistrationService;

  constructor(registrationService: RegistrationService) {
    this.registrationService = registrationService;
  }

  getTransactionRouting(): RequestHandler {
    return (request: Request, response: Response, next: NextFunction) => {
      try {
        const transactionType = this.getTransactionType(request.path);

        const result = this.registrationService.getRegistrationRouting(
          transactionType as TransactionRegistrationType
        );

        const transactionRouting = this.inserIdInAllUrl(
          result,
          request.params.transactionId,
          request.params.submissionId
        );

        response.render(this.templateName(transactionRouting.currentUrl), {
          props: transactionRouting,
        });
      } catch (error) {
        next(error);
      }
    };
  }

  createTransaction(): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const transactionType = request.body.transactionType;

        const result = await this.registrationService.createTransaction(
          transactionType
        );

        if (result?.errors?.length) {
          response.render(this.templateName(result.currentUrl), {
            props: result,
          });
          return;
        }

        response.redirect(
          this.inserTransactionId(result.nextUrl, result?.data?.transactionId)
        );
      } catch (error) {
        next(error);
      }
    };
  }

  createSubmissionFromTransaction(): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const transactionId = request.params.transactionId;
        const transactionType = request.body.transactionType;

        const result =
          await this.registrationService.createSubmissionFromTransaction(
            transactionType,
            transactionId,
            request.body
          );

        if (result?.errors?.length) {
          response.render(this.templateName(result.currentUrl), {
            props: result,
          });
          return;
        }

        const url = this.inserSubmissionId(
          this.inserTransactionId(result.nextUrl, transactionId),
          result?.data?.submissionId
        );

        response.redirect(url);
      } catch (error) {
        next(error);
      }
    };
  }

  private getTransactionType(path: string) {
    const type = this.templateName(path);

    return type as TransactionRegistrationType;
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
    transactionRouting: TransactionRouting,
    transactionId: string,
    submissionId: string
  ): TransactionRouting {
    return {
      ...transactionRouting,
      previousUrl: this.inserSubmissionId(
        this.inserTransactionId(transactionRouting.previousUrl, transactionId),
        submissionId
      ),
      currentUrl: this.inserSubmissionId(
        this.inserTransactionId(transactionRouting.currentUrl, transactionId),
        submissionId
      ),
      nextUrl: this.inserSubmissionId(
        this.inserTransactionId(transactionRouting.nextUrl, transactionId),
        submissionId
      ),
    };
  }
}

export default RegistrationController;
