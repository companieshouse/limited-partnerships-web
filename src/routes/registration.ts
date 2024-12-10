import { Router } from "express";

import { authentication } from "../middlewares";

import { IDependencies } from "../config/IDependencies";

import {
  EMAIL_URL,
  NAME_URL,
  NEXT_URL,
  WHICH_TYPE_URL,
  GENERAL_PARTNERS_URL,
  GENERAL_PARTNER_CHOICE_URL,
} from "../presentation/controller/registration/Routing";

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
    dependencies.registrationController.redirectWithParameter()
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
    dependencies.registrationController.redirectWithParameter()
  );
  router.get(
    NEXT_URL,
    authentication,
    dependencies.registrationController.getPageRouting()
  );
};

export default registrationEndpoints;
