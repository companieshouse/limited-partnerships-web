import { Router } from "express";

import { authentication } from "../middlewares";

import { IDependencies } from "../config/IDependencies";

import {
  COMPANY_NUMBER_URL,
  CONFIRM_LIMITED_PARTNERSHIP_URL
} from "../presentation/controller/transition/url";

export const transitionEndpoints = (
  router: Router,
  dependencies: IDependencies
): void => {
  router.get(
    COMPANY_NUMBER_URL,
    authentication,
    dependencies.transitionController.getPageRouting()
  );

  router.get(
    CONFIRM_LIMITED_PARTNERSHIP_URL,
    authentication,
    dependencies.transitionController.getPageRouting()
  );
};
