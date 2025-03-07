import { NextFunction, Request, RequestHandler, Response } from "express";
import AbstractController from "../AbstractController";
import transitionRouting from "./Routing";
import TransitionPageType from "./PageType";
import CompanyService from "../../../application/service/CompanyService";

class TransitionController extends AbstractController {
  constructor(private companyService: CompanyService) {
    super();
  }

  getPageRouting(): RequestHandler {
    return (request: Request, response: Response, next: NextFunction) => {
      try {
        const { pageType } = super.extract(request);
        const pageRouting = super.getRouting(transitionRouting, pageType, request);

        response.render(
          super.templateName(pageRouting.currentUrl),
          super.makeProps(pageRouting, null, null)
        );
      } catch (error) {
        console.log("ercode:" + error);
        next(error);
      }
    };
  }

  checkCompanyNumber(): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { tokens } = super.extract(request);
        const pageType = super.extractPageTypeOrThrowError(request, TransitionPageType);
        const pageRouting = super.getRouting(transitionRouting, pageType, request);
        const { company_number } = request.body;

        const result = await this.companyService.getCompanyProfile(tokens, company_number);

        if (result.errors) {
          response.render(
            super.templateName(pageRouting.currentUrl),
            super.makeProps(pageRouting, { company_number }, result.errors)
          );

          return;
        }

        response.redirect(pageRouting.nextUrl);
      } catch (error) {
        console.error(error);
        next(error);
      }
    };
  }
}

export default TransitionController;
