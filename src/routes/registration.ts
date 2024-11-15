import { Router } from "express";

import * as config from "../config";
import { authentication } from "../middlewares";

import { IDependencies } from "../config/IDependencies";

import {
  NAME_URL,
  NEXT2_URL,
  NEXT_URL,
} from "../application/registration/Routing";

export const registrationEndpoints = (
  router: Router,
  dependencies: IDependencies
): void => {
  router.get(
    config.START_URL,
    authentication,
    dependencies.registrationController.getTransactionRouting()
  );
  router.post(
    config.START_URL,
    authentication,
    dependencies.registrationController.createTransaction()
  );

  router.get(
    NAME_URL,
    authentication,
    dependencies.registrationController.getTransactionRouting()
  );
  router.post(
    NAME_URL,
    authentication,
    dependencies.registrationController.createSubmissionFromTransaction()
  );

  router.get(
    NEXT_URL,
    authentication,
    dependencies.registrationController.getTransactionRouting()
  );

  // Only for demo - to be removed
  router.get(
    NEXT2_URL,
    authentication,
    dependencies.registrationController.getTransactionRouting()
  );
};

export default registrationEndpoints;