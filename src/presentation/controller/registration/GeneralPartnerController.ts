import { NextFunction, Request, RequestHandler, Response } from "express";

import GeneralPartnerService from "../../../application/service/GeneralPartnerService";
import registrationsRouting from "./Routing";
import AbstractController from "../AbstractController";
import RegistrationPageType from "./PageType";

class GeneralPartnerController extends AbstractController {
  private generalPartnerService: GeneralPartnerService;

  constructor(generalPartnerService: GeneralPartnerService) {
    super();
    this.generalPartnerService = generalPartnerService;
  }

  getPageRouting(): RequestHandler {
    return (request: Request, response: Response, next: NextFunction) => {
      try {
        const { pageType } = super.extract(request);
        const pageRouting = super.getRouting(registrationsRouting, pageType, request);

        const generalPartner = {};

        response.render(
          super.templateName(pageRouting.currentUrl),
          super.makeProps(pageRouting, { generalPartner }, null)
        );
      } catch (error) {
        next(error);
      }
    };
  }

  createGeneralPartner(): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens, ids } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, RegistrationPageType);
        const pageRouting = super.getRouting(registrationsRouting, pageType, request);

        const result = await this.generalPartnerService.createGeneralPartner(
          tokens,
          ids.transactionId,
          request.body
        );

        if (result.errors) {
          response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(pageRouting, { generalPartner: { data: request.body } /* , cache */ }, result.errors)
          );

          return;
        }

        const url = super.insertIdsInUrl(pageRouting.nextUrl, ids.transactionId, /* result.transactionId, */ result.generalPartnerId);

        response.redirect(url);
      } catch (error) {
        next(error);
      }
    };
  }
}

export default GeneralPartnerController;
