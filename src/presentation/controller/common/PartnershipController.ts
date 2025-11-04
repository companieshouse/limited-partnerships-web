import { NextFunction, Request, Response } from "express";

import AbstractController from "../AbstractController";
import { YOUR_FILINGS_URL } from "../../../config/constants";

class PartnershipController extends AbstractController {
  continueSavedFiling(pageType, routing) {
    return (request: Request, response: Response, next: NextFunction) => {
      try {
        if (request.body["continue_saved_filing"] === "YES") {
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
