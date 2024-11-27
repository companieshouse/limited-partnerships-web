import { Router } from "express";

import { IDependencies } from "../config/IDependencies";
import { authentication } from "../middlewares";
import {
  HEALTHCHECK_URL,
  START_URL,
} from "../presentation/controller/global/Routing";

export const globalEndpoints = (
  router: Router,
  dependencies: IDependencies
): void => {
  router.get(HEALTHCHECK_URL, dependencies.globalController.getHealthcheck());

  router.get(
    START_URL,
    authentication,
    dependencies.globalController.getPageRouting()
  );
};

export default globalEndpoints;
