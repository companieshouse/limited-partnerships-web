import { Router } from "express";

import { IDependencies } from "../config/IDependencies";
import {
  HEALTHCHECK_URL,
  SIGN_OUT_URL,
  PAYMENT_RESPONSE_URL,
  PAYMENT_FAILED_URL,
  CONFIRMATION_URL,
  RESUME_JOURNEY_URL,
  CONFIRMATION_POST_TRANSITION_URL,
  RESUME_JOURNEY_POST_TRANSITION_GENERAL_PARTNER_URL,
  RESUME_JOURNEY_POST_TRANSITION_LIMITED_PARTNER_URL,
  RESUME_JOURNEY_POST_TRANSITION_PARTNERSHIP_URL,
} from "../presentation/controller/global/url";
import GlobalController from "../presentation/controller/global/Controller";

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
    CONFIRMATION_POST_TRANSITION_URL,
    dependencies.globalController.getConfirmationPagePostTransition()
  );

  router.get(
    RESUME_JOURNEY_URL,
    dependencies.globalController.resumeJourney()
  );

  router.get(
    RESUME_JOURNEY_POST_TRANSITION_GENERAL_PARTNER_URL,
    dependencies.globalController.resumeJourneyPostTransition(GlobalController.RESUME_GENERAL_PARTNER_URL_MAP)
  );

  router.get(
    RESUME_JOURNEY_POST_TRANSITION_LIMITED_PARTNER_URL,
    dependencies.globalController.resumeJourneyPostTransition(GlobalController.RESUME_LIMITED_PARTNER_URL_MAP)
  );

  router.get(
    RESUME_JOURNEY_POST_TRANSITION_PARTNERSHIP_URL,
    dependencies.globalController.resumeJourneyPostTransition(GlobalController.RESUME_PARTNERSHIP_URL_MAP)
  );

  router.get(
    PAYMENT_FAILED_URL,
    dependencies.globalController.getPageRouting()
  );
};

export default globalEndpoints;
