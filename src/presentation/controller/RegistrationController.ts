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
          request.params.id
        );

        response.render(this.templateName(transactionRouting.currentUrl), {
          data: transactionRouting,
        });
      } catch (error) {
        next(error);
      }
    };
  }

  createSubmissionFromTransaction(): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const transactionId = request.params.transactionId;

        const result =
          await this.registrationService.createSubmissionFromTransaction(
            TransactionRegistrationType.START,
            transactionId,
            request.body
          );

        if (result?.errors?.length) {
          response.render(this.templateName(result.currentUrl), {
            data: result.data,
          });
          return;
        }

        response.redirect(
          this.inserId(result.nextUrl, result?.data?.transactionId)
        );
      } catch (error) {
        next(error);
      }
    };
  }

  private getTransactionType(path: string) {
    let id = this.templateName(path);
    if (id.includes("-")) {
      id = id.replace("-", "_");
    }
    return id.toUpperCase() as TransactionRegistrationType;
  }

  private templateName(url: string): string {
    const splitted = url.split("/");
    return splitted[splitted.length - 1];
  }

  private inserId(url: string, transactionId: string): string {
    return transactionId ? url.replace(":id", transactionId) : url;
  }

  private inserIdInAllUrl(
    transactionRouting: TransactionRouting,
    transactionId: string
  ): TransactionRouting {
    return {
      ...transactionRouting,
      previousUrl: this.inserId(transactionRouting.previousUrl, transactionId),
      currentUrl: this.inserId(transactionRouting.currentUrl, transactionId),
      nextUrl: this.inserId(transactionRouting.nextUrl, transactionId),
    };
  }
}

export default RegistrationController;
