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
  GENERAL_PARTNER_CHOICE_URL,
  LANDING_PAGE_URL
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
    dependencies.limitedPartnershipPostTransitionController.getCompanyPage()
  );
  router.post(
    CONFIRM_LIMITED_PARTNERSHIP_URL,
    authentication,
    dependencies.limitedPartnershipPostTransitionController.limitedPartnershipConfirm()
  );

  router.get(
    LANDING_PAGE_URL,
    authentication,
    dependencies.limitedPartnershipPostTransitionController.getCompanyPage()
  );

  router.get(
    GENERAL_PARTNER_CHOICE_URL,
    authentication,
    dependencies.generalPartnerPostTransitionController.getPageRouting()
  );
  router.post(
    GENERAL_PARTNER_CHOICE_URL,
    authentication,
    dependencies.generalPartnerPostTransitionController.generalPartnerChoice()
  );

  router.get(
    ADD_GENERAL_PARTNER_PERSON_URL,
    authentication,
    dependencies.generalPartnerPostTransitionController.getPageRouting()
  );
  router.post(
    ADD_GENERAL_PARTNER_PERSON_URL,
    authentication,
    dependencies.generalPartnerPostTransitionController.createGeneralPartner()
  );

  router.get(
    ADD_GENERAL_PARTNER_PERSON_WITH_ID_URL,
    authentication,
    dependencies.generalPartnerPostTransitionController.getPageRouting()
  );
  router.post(
    ADD_GENERAL_PARTNER_PERSON_WITH_ID_URL,
    authentication,
    dependencies.generalPartnerPostTransitionController.sendPageData()
  );

  router.get(
    ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
    authentication,
    dependencies.generalPartnerPostTransitionController.getPageRouting()
  );
  router.post(
    ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
    authentication,
    dependencies.generalPartnerPostTransitionController.createGeneralPartner()
  );

  router.get(
    ADD_GENERAL_PARTNER_LEGAL_ENTITY_WITH_ID_URL,
    authentication,
    dependencies.generalPartnerPostTransitionController.getPageRouting()
  );
  router.post(
    ADD_GENERAL_PARTNER_LEGAL_ENTITY_WITH_ID_URL,
    authentication,
    dependencies.generalPartnerPostTransitionController.sendPageData()
  );
};

export default transitionEndpoints;
