import { NextFunction, Request, Response } from "express";

import AbstractController from "../AbstractController";
import { YOUR_FILINGS_URL } from "../../../config/constants";
import UIErrors from "../../../domain/entities/UIErrors";

class PartnershipController extends AbstractController {
  continueSavedFiling(pageType, routing) {
    return (request: Request, response: Response, next: NextFunction) => {
      try {
        const selection = request.body["continue_saved_filing"];

        if (selection !== "YES" && selection !== "NO") {
          const type = this.extractPageTypeOrThrowError(request, pageType);
          const pageRouting = this.getRouting(routing, type, request);

          const uiErrors = new UIErrors().setWebError(
            "continue_saved_filing",
            response.locals.i18n.continueSavedFilingPage.errorMessage
          );

          return response.render(
            this.templateName(pageRouting.currentUrl),
            this.makeProps(pageRouting, null, uiErrors)
          );
        }

        if (selection === "YES") {
          return response.redirect(YOUR_FILINGS_URL);
        }

        const type = this.extractPageTypeOrThrowError(request, pageType);
        const pageRouting = this.getRouting(routing, type, request);

        return response.redirect(pageRouting.nextUrl);
      } catch (error) {
        next(error);
      }
    };
  }
}

export default PartnershipController;
