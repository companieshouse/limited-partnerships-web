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
  ADD_GENERAL_PARTNER_PERSON_URL,
  GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_CHOICE_URL,
  LIMITED_PARTNER_CHOICE_URL,
  CHECK_YOUR_ANSWERS_URL,
  NAME_WITH_IDS_URL,
  TERM_URL,
  APPLICATION_SUBMITTED_URL,
  ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL
} from "../presentation/controller/registration/url";

export const registrationEndpoints = (
  router: Router,
  dependencies: IDependencies
): void => {
  router.get(
    WHICH_TYPE_URL,
    authentication,
    dependencies.limitedPartnershipController.getPageRouting()
  );
  router.post(
    WHICH_TYPE_URL,
    authentication,
    dependencies.limitedPartnershipController.redirectAndCacheSelection()
  );

  router.get(
    NAME_URL,
    authentication,
    dependencies.limitedPartnershipController.getPageRouting()
  );
  router.post(
    NAME_URL,
    authentication,
    dependencies.limitedPartnershipController.createTransactionAndFirstSubmission()
  );

  router.get(
    NAME_WITH_IDS_URL,
    authentication,
    dependencies.limitedPartnershipController.getPageRouting()
  );
  router.post(
    NAME_WITH_IDS_URL,
    authentication,
    dependencies.limitedPartnershipController.sendPageData()
  );

  router.get(
    EMAIL_URL,
    authentication,
    dependencies.limitedPartnershipController.getPageRouting()
  );
  router.post(
    EMAIL_URL,
    authentication,
    dependencies.limitedPartnershipController.sendPageData()
  );

  router.get(
    WHERE_IS_THE_JURISDICTION_URL,
    authentication,
    dependencies.limitedPartnershipController.getPageRouting()
  );
  router.post(
    WHERE_IS_THE_JURISDICTION_URL,
    authentication,
    dependencies.limitedPartnershipController.sendPageData()
  );

  router.get(
    TERM_URL,
    authentication,
    dependencies.limitedPartnershipController.getPageRouting()
  );
  router.post(
    TERM_URL,
    authentication,
    dependencies.limitedPartnershipController.sendPageData()
  );

  router.get(
    GENERAL_PARTNERS_URL,
    authentication,
    dependencies.limitedPartnershipController.getPageRouting()
  );

  router.get(
    GENERAL_PARTNER_CHOICE_URL,
    authentication,
    dependencies.limitedPartnershipController.getPageRouting()
  );
  router.post(
    GENERAL_PARTNER_CHOICE_URL,
    authentication,
    dependencies.limitedPartnershipController.generalPartnerChoice()
  );

  router.get(
    ADD_GENERAL_PARTNER_PERSON_URL,
    authentication,
    dependencies.generalPartnerController.getPageRouting()
  );
  router.post(
    ADD_GENERAL_PARTNER_PERSON_URL,
    authentication,
    dependencies.generalPartnerController.createGeneralPartner()
  );

  router.get(
    GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_CHOICE_URL,
    authentication,
    dependencies.generalPartnerController.getPageRouting()
  );

  router.get(
    ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
    authentication,
    dependencies.generalPartnerController.getPageRouting()
  );
  router.post(
    ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
    authentication,
    dependencies.generalPartnerController.createGeneralPartner()
  );

  router.get(
    LIMITED_PARTNERS_URL,
    authentication,
    dependencies.limitedPartnershipController.getPageRouting()
  );

  router.get(
    LIMITED_PARTNER_CHOICE_URL,
    authentication,
    dependencies.limitedPartnershipController.getPageRouting()
  );
  router.post(
    LIMITED_PARTNER_CHOICE_URL,
    authentication,
    // to be changed - use different method
    dependencies.limitedPartnershipController.redirectAndCacheSelection()
  );

  router.get(
    CHECK_YOUR_ANSWERS_URL,
    authentication,
    dependencies.limitedPartnershipController.getPageRouting()
  );

  router.post(
    CHECK_YOUR_ANSWERS_URL,
    authentication,
    dependencies.limitedPartnershipController.redirectAndCacheSelection()
  );

  router.get(
    APPLICATION_SUBMITTED_URL,
    authentication,
    dependencies.limitedPartnershipController.getPageRouting()
  );

  router.get(
    NEXT_URL,
    authentication,
    dependencies.limitedPartnershipController.getPageRouting()
  );
};

export default registrationEndpoints;
