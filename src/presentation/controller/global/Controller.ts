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
        const pageType = super.pageType(request.path);

        const pageRouting = super.getRouting(registrationsRouting, pageType);

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