import { NextFunction, Request, RequestHandler, Response } from "express";

import registrationsRouting from "./Routing";
import AbstractController from "../AbstractController";

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
          registrationsRouting,
          pageType,
          request.url
        );

        response.render(super.templateName(pageRouting.currentUrl), {
          props: pageRouting,
        });
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

export default GlobalController;
