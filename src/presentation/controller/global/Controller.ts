import { NextFunction, Request, RequestHandler, Response } from "express";

import globalsRouting from "./Routing";
import AbstractController from "../AbstractController";
import { ACCOUNTS_SIGN_OUT_URL, BASE_URL, COOKIE_NAME, COOKIE_DOMAIN } from "../../../config/constants";

class GlobalController extends AbstractController {
  constructor() {
    super();
  }

  getPageRouting(): RequestHandler {
    return (request: Request, response: Response, next: NextFunction) => {
      try {
        // example error message using the locales json files
        // const errorMessage = response.locals.i18n["startPage"]["errorStartAddressMissing"];

        const pageType = super.pageType(request.path);

        const pageRouting = super.getRouting(
          globalsRouting,
          pageType,
          request
        );

        response.render(super.templateName(pageRouting.currentUrl), {
          props: pageRouting
        });
      } catch (error) {
        next(error);
      }
    };
  }

  getSignOut(): RequestHandler {
    return (request: Request, response: Response, next: NextFunction) => {
      try {
        const previousPageUrl = this.getPreviousPageUrl(request);
        const pageType = super.pageType(request.path);
        const pageRouting = super.getRouting(
          globalsRouting,
          pageType,
          request
        );
        pageRouting.previousUrl = previousPageUrl;
        response.render(super.templateName(pageRouting.currentUrl), {
          props: pageRouting
        });
      } catch (error) {
        next(error);
      }
    };
  }

  signOutChoice(): RequestHandler {
    return (request: Request, response: Response, next: NextFunction) => {
      try {
        if (request.body["sign_out"] === 'yes') {
          response.clearCookie(COOKIE_NAME, { domain: COOKIE_DOMAIN });
          response.end();
          return response.redirect(ACCOUNTS_SIGN_OUT_URL);
        }
        const previousPage = request.body["previousPage"];

        return redirectWithChecks(response, previousPage);
      } catch (error) {
        next(error);
      }
    };
  }

  getHealthcheck(): RequestHandler {
    return (_request: Request, response: Response, next: NextFunction) => {
      try {
        response.status(200).json({ status: "OK" });
      } catch (error) {
        next(error);
      }
    };
  }
}

export const redirectWithChecks = (response: Response, url: string): void => {
  if (url.startsWith(BASE_URL)) {
    return response.redirect(url);
  }
};

export default GlobalController;
