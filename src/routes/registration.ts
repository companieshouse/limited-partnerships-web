import { Router } from "express";

import * as config from "../config";
import { authentication } from "../middlewares";

import { IDependencies } from "../config/IDependencies";

import {
  NAME_URL,
  NEXT2_URL,
  NEXT_URL,
} from "../presentation/controller/registration/Routing";

export const registrationEndpoints = (
  router: Router,
  dependencies: IDependencies
): void => {
  router.get(
    config.START_URL,
    authentication,
    dependencies.registrationController.getPageRouting()
  );

  router.get(
    NAME_URL,
    authentication,
    dependencies.registrationController.getPageRouting()
  );
  router.post(
    NAME_URL,
    authentication,
    dependencies.registrationController.createTransactionAndFirstSubmission()
  );

  router.get(
    NEXT_URL,
    authentication,
    dependencies.registrationController.getPageRouting()
  );

  // Only for demo - to be removed
  router.get(
    NEXT2_URL,
    authentication,
    dependencies.registrationController.getPageRouting()
  );
};

export default registrationEndpoints;
