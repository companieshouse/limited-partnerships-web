import { NextFunction, Request, RequestHandler, Response } from "express";
import AbstractController from "../AbstractController";
import transitionRouting from "./Routing";
import CacheService from "../../../application/service/CacheService";

class TransitionController extends AbstractController {
  private cacheService: CacheService;

  constructor(cacheService: CacheService) {
    super();
    this.cacheService = cacheService;
  }

  getPageRouting(): RequestHandler {
    return async (request: Request, response: Response, next: NextFunction) => {
      try {
        const { session, pageType, ids } = super.extract(request);
        const pageRouting = super.getRouting(transitionRouting, pageType, request);
        const cache = await this.cacheService.getDataFromCache(session);
        response.render(
          super.templateName(pageRouting.currentUrl),
          super.makeProps(pageRouting, { cache, ids }, null)
        );
      } catch (error) {
        next(error);
      }
    };
  }
}

export default TransitionController;
