import { Router } from "express";

import { authentication } from "../middlewares";

import { IDependencies } from "../config/IDependencies";

import {
  CHECK_YOUR_ANSWERS_URL,
  COMPANY_NUMBER_URL,
  CONFIRM_LIMITED_PARTNERSHIP_URL,
  EMAIL_URL
} from "../presentation/controller/transition/url";

const transitionEndpoints = (router: Router, dependencies: IDependencies): void => {
  router.get(
    COMPANY_NUMBER_URL,
    authentication,
    dependencies.limitedPartnershipTransitionController.getPageRouting()
  );
  router.post(
    COMPANY_NUMBER_URL,
    authentication,
    dependencies.limitedPartnershipTransitionController.checkCompanyNumber()
  );

  router.get(
    CONFIRM_LIMITED_PARTNERSHIP_URL,
    authentication,
    dependencies.limitedPartnershipTransitionController.getConfirmPage()
  );
  router.post(
    CONFIRM_LIMITED_PARTNERSHIP_URL,
    authentication,
    dependencies.limitedPartnershipTransitionController.limitedPartnershipConfirm()
  );

  router.get(
    EMAIL_URL,
    authentication,
    dependencies.limitedPartnershipTransitionController.getPageRouting()
  );
  router.post(
    EMAIL_URL,
    authentication,
    dependencies.limitedPartnershipTransitionController.sendPageData()
  );

  router.get(
    CHECK_YOUR_ANSWERS_URL,
    authentication,
    dependencies.limitedPartnershipTransitionController.getPageRouting()
  );
};

export default transitionEndpoints;
