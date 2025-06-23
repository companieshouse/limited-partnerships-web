import { Router } from "express";

import { authentication } from "../middlewares";

import { IDependencies } from "../config/IDependencies";

import {
  ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  ADD_GENERAL_PARTNER_LEGAL_ENTITY_WITH_ID_URL,
  ADD_GENERAL_PARTNER_PERSON_URL,
  ADD_GENERAL_PARTNER_PERSON_WITH_ID_URL,
  COMPANY_NUMBER_URL,
  CONFIRM_LIMITED_PARTNERSHIP_URL,
  EMAIL_URL,
  GENERAL_PARTNER_CHOICE_URL,
  GENERAL_PARTNERS_URL
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
    GENERAL_PARTNERS_URL,
    authentication,
    dependencies.limitedPartnershipTransitionController.getPageRouting()
  );

  router.get(
    GENERAL_PARTNER_CHOICE_URL,
    authentication,
    dependencies.limitedPartnershipTransitionController.getPageRouting()
  );
  router.post(
    GENERAL_PARTNER_CHOICE_URL,
    authentication,
    dependencies.generalPartnerTransitionController.generalPartnerChoice()
  );

  router.get(
    ADD_GENERAL_PARTNER_PERSON_URL,
    authentication,
    dependencies.generalPartnerTransitionController.getPageRouting()
  );
  router.post(
    ADD_GENERAL_PARTNER_PERSON_URL,
    authentication,
    dependencies.generalPartnerTransitionController.createGeneralPartner()
  );

  router.get(
    ADD_GENERAL_PARTNER_PERSON_WITH_ID_URL,
    authentication,
    dependencies.generalPartnerTransitionController.getPageRouting()
  );
  router.post(
    ADD_GENERAL_PARTNER_PERSON_WITH_ID_URL,
    authentication,
    dependencies.generalPartnerTransitionController.sendPageData()
  );

  router.get(
    ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
    authentication,
    dependencies.generalPartnerTransitionController.getPageRouting()
  );
  router.post(
    ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
    authentication,
    dependencies.generalPartnerTransitionController.createGeneralPartner()
  );

  router.get(
    ADD_GENERAL_PARTNER_LEGAL_ENTITY_WITH_ID_URL,
    authentication,
    dependencies.generalPartnerTransitionController.getPageRouting()
  );
  router.post(
    ADD_GENERAL_PARTNER_LEGAL_ENTITY_WITH_ID_URL,
    authentication,
    dependencies.generalPartnerTransitionController.sendPageData()
  );
};

export default transitionEndpoints;
