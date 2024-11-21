import { NextFunction, Request, RequestHandler, Response } from "express";

import RegistrationService from "../../../application/registration/Service";
import PageRegistrationType from "./PageRegistrationType";
import registrationsRouting, { NEXT2_URL } from "./Routing";
import { NameEndingType } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships";
import Controller from "../Controller";
import TransactionLimitedPartnership from "domain/entities/TransactionLimitedPartnership";
import { PageRouting } from "../PageRouting";

class RegistrationController extends Controller {
  private registrationService: RegistrationService;

  constructor(registrationService: RegistrationService) {
    super();
    this.registrationService = registrationService;
  }

  getPageRouting(): RequestHandler {
    return (request: Request, response: Response, next: NextFunction) => {
      try {
        const pageType = super.pageType(request.path);

        const result = super.getRouting(
          registrationsRouting,
          pageType as PageRegistrationType
        );

        const pageRouting = super.inserIdsInAllUrl(
          result,
          request.params.transactionId,
          request.params.submissionId
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
        const pageType = request.body.pageType;

        const result =
          await this.registrationService.createTransactionAndFirstSubmission(
            pageType,
            request.body
          );

        let registrationRouting = super.getRouting(
          registrationsRouting,
          pageType
        );

        if (result?.errors?.length) {
          response.render(super.templateName(registrationRouting.currentUrl), {
            props: result,
          });
          return;
        }

        registrationRouting = this.updateNextUrl(
          result?.limitedPartnership,
          registrationRouting
        );

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

  private updateNextUrl(
    limitedPartnership: TransactionLimitedPartnership,
    registrationRouting: PageRouting
  ) {
    if (
      limitedPartnership?.data?.name_ending !==
      NameEndingType.LIMITED_PARTNERSHIP
    ) {
      registrationRouting = {
        ...registrationRouting,
        nextUrl: NEXT2_URL,
      };
    }

    return registrationRouting;
  }
}

export default RegistrationController;
