import { Router } from "express";

import { IDependencies } from "../config/IDependencies";
import {
  HEALTHCHECK_URL,
  SIGN_OUT_URL,
  PAYMENT_RESPONSE_URL,
  PAYMENT_FAILED_URL,
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
    dependencies.globalController.getSignOut()
  );

  router.post(
    SIGN_OUT_URL,
    dependencies.globalController.signOutChoice()
  );

  router.get(
    PAYMENT_RESPONSE_URL,
    dependencies.globalController.getPaymentDecision()
  );

  router.get(
    CONFIRMATION_URL,
    dependencies.globalController.getConfirmationPage()
  );

  router.get(
    RESUME_JOURNEY_URL,
    dependencies.globalController.resumeJourney()
  );

  router.get(
    PAYMENT_FAILED_URL,
    dependencies.globalController.getPageRouting()
  );
};

export default globalEndpoints;
