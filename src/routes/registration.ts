import { Router } from "express";

import { authentication } from "../middlewares";

import { IDependencies } from "../config/IDependencies";

import {
  EMAIL_URL,
  WHERE_IS_THE_JURISDICTION_URL,
  NAME_URL,
  NEXT_URL,
  WHICH_TYPE_URL,
  LIMITED_PARTNERS_URL,
  GENERAL_PARTNERS_URL,
  GENERAL_PARTNER_CHOICE_URL,
  LIMITED_PARTNER_CHOICE_URL,
  CHECK_YOUR_ANSWERS_URL,
  NAME_WITH_IDS_URL,
  TERM_URL
} from "../presentation/controller/registration/url";

export const registrationEndpoints = (
  router: Router,
  dependencies: IDependencies
): void => {
  router.get(
    WHICH_TYPE_URL,
    authentication,
    dependencies.registrationController.getPageRouting()
  );
  router.post(
    WHICH_TYPE_URL,
    authentication,
    dependencies.registrationController.redirectAndCacheSelection()
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
    NAME_WITH_IDS_URL,
    authentication,
    dependencies.registrationController.getPageRouting()
  );
  router.post(
    NAME_WITH_IDS_URL,
    authentication,
    dependencies.registrationController.sendPageData()
  );

  router.get(
    EMAIL_URL,
    authentication,
    dependencies.registrationController.getPageRouting()
  );
  router.post(
    EMAIL_URL,
    authentication,
    dependencies.registrationController.sendPageData()
  );

  router.get(
    WHERE_IS_THE_JURISDICTION_URL,
    authentication,
    dependencies.registrationController.getPageRouting()
  );
  router.post(
    WHERE_IS_THE_JURISDICTION_URL,
    authentication,
    dependencies.registrationController.sendPageData()
  );

  router.get(
    TERM_URL,
    authentication,
    dependencies.registrationController.getPageRouting()
  );
  router.post(
    TERM_URL,
    authentication,
    dependencies.registrationController.sendPageData()
  );

  router.get(
    GENERAL_PARTNERS_URL,
    authentication,
    dependencies.registrationController.getPageRouting()
  );

  router.get(
    GENERAL_PARTNER_CHOICE_URL,
    authentication,
    dependencies.registrationController.getPageRouting()
  );
  router.post(
    GENERAL_PARTNER_CHOICE_URL,
    authentication,
    // to be changed - use different method
    dependencies.registrationController.redirectAndCacheSelection()
  );

  router.get(
    LIMITED_PARTNERS_URL,
    authentication,
    dependencies.registrationController.getPageRouting()
  );

  router.get(
    LIMITED_PARTNER_CHOICE_URL,
    authentication,
    dependencies.registrationController.getPageRouting()
  );
  router.post(
    LIMITED_PARTNER_CHOICE_URL,
    authentication,
    // to be changed - use different method
    dependencies.registrationController.redirectAndCacheSelection()
  );

  router.get(
    CHECK_YOUR_ANSWERS_URL,
    authentication,
    dependencies.registrationController.getPageRouting()
  );

  router.post(
    CHECK_YOUR_ANSWERS_URL,
    authentication,
    dependencies.registrationController.redirectAndCacheSelection()
  );

  router.get(
    NEXT_URL,
    authentication,
    dependencies.registrationController.getPageRouting()
  );
};

export default registrationEndpoints;
