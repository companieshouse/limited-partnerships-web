import { Router } from "express";

import { IDependencies } from "../config/IDependencies";
import { authentication } from "../middlewares";
import {
  HEALTHCHECK_URL,
  SIGN_OUT_URL,
  CONFIRMATION_URL,
  RESUME_JOURNEY_URL,
} from "../presentation/controller/global/url";

export const globalEndpoints = (
  router: Router,
  dependencies: IDependencies
): void => {
  router.get(HEALTHCHECK_URL, dependencies.globalController.getHealthcheck());

  router.get(
    SIGN_OUT_URL,
    authentication,
    dependencies.globalController.getSignOut()
  );

  router.post(
    SIGN_OUT_URL,
    authentication,
    dependencies.globalController.signOutChoice()
  );

  router.get(
    CONFIRMATION_URL,
    authentication,
    dependencies.globalController.getConfirmationPage()
  );

  router.get(
    RESUME_JOURNEY_URL,
    authentication,
    dependencies.globalController.resumeJourney()
  );
};

export default globalEndpoints;
