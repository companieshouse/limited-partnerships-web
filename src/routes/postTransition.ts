import { Router } from "express";

import { authentication } from "../middlewares";

import { IDependencies } from "../config/IDependencies";

import {
  COMPANY_NUMBER_URL,
  CONFIRM_LIMITED_PARTNERSHIP_URL
} from "../presentation/controller/postTransition/url";

const transitionEndpoints = (router: Router, dependencies: IDependencies): void => {
  router.get(
    COMPANY_NUMBER_URL,
    authentication,
    dependencies.limitedPartnershipPostTransitionController.getPageRouting()
  );
  router.post(
    COMPANY_NUMBER_URL,
    authentication,
    dependencies.limitedPartnershipPostTransitionController.checkCompanyNumber()
  );

  router.get(
    CONFIRM_LIMITED_PARTNERSHIP_URL,
    authentication,
    dependencies.limitedPartnershipPostTransitionController.getConfirmPage()
  );
  router.post(
    CONFIRM_LIMITED_PARTNERSHIP_URL,
    authentication,
    dependencies.limitedPartnershipPostTransitionController.limitedPartnershipConfirm()
  );
};

export default transitionEndpoints;
