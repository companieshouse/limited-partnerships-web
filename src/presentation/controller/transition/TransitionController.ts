import { NextFunction, Request, RequestHandler, Response } from "express";
import AbstractController from "../AbstractController";
import transitionRouting from "./Routing";

class TransitionController extends AbstractController {

  constructor() {
    super();
  }

  getPageRouting(): RequestHandler {
    return (request: Request, response: Response, next: NextFunction) => {
      try {
        const { pageType, ids } = super.extract(request);
        const pageRouting = super.getRouting(transitionRouting, pageType, request);
        response.render(
          super.templateName(pageRouting.currentUrl),
          super.makeProps(pageRouting, { ids }, null)
        );
      } catch (error) {
        next(error);
      }
    };
  }
}

export default TransitionController;
