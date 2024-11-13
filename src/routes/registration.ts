import { Router } from "express";

import * as config from "../config";
import * as controllers from "../controllers";
import { authentication } from "../middlewares";

import { IDependencies } from "../config/IDependencies";

export const registrationEndpoints = (
  router: Router,
  dependencies: IDependencies
): void => {
  router.get(config.HEALTHCHECK_URL, controllers.healthCheckController.get);

  router.get(
    config.START_URL,
    authentication,
    controllers.startController.get
    // dependencies.registrationController.getTransactionRouting()
  );
};

export default registrationEndpoints;
