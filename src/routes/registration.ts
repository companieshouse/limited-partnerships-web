import { Router } from "express";

import { authentication } from "../middlewares";

import { IDependencies } from "../config/IDependencies";

import {
  EMAIL_URL,
  WHERE_IS_THE_JURISDICTION_URL,
  NAME_URL,
  WHICH_TYPE_URL,
  LIMITED_PARTNERS_URL,
  GENERAL_PARTNERS_URL,
  GENERAL_PARTNER_CHOICE_URL,
  ADD_GENERAL_PARTNER_PERSON_URL,
  LIMITED_PARTNER_CHOICE_URL,
  ADD_LIMITED_PARTNER_PERSON_URL,
  ADD_LIMITED_PARTNER_PERSON_WITH_ID_URL,
  CHECK_YOUR_ANSWERS_URL,
  NAME_WITH_IDS_URL,
  TERM_URL,
  ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  ADD_GENERAL_PARTNER_PERSON_WITH_ID_URL,
  ADD_GENERAL_PARTNER_LEGAL_ENTITY_WITH_ID_URL,
  WHICH_TYPE_WITH_IDS_URL,
  SIC_URL,
  REVIEW_GENERAL_PARTNERS_URL,
  REMOVE_GENERAL_PARTNER_URL,
  ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
  ADD_LIMITED_PARTNER_LEGAL_ENTITY_WITH_ID_URL,
  REVIEW_LIMITED_PARTNERS_URL,
  REMOVE_LIMITED_PARTNER_URL
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
    WHICH_TYPE_WITH_IDS_URL,
    authentication,
    dependencies.limitedPartnershipController.getPageRouting()
  );
  router.post(
    WHICH_TYPE_WITH_IDS_URL,
    authentication,
    dependencies.limitedPartnershipController.redirectWhichTypeWithIds()
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
    dependencies.limitedPartnershipController.getPageRoutingTermSic()
  );
  router.post(
    TERM_URL,
    authentication,
    dependencies.limitedPartnershipController.sendPageData()
  );

  router.get(
    SIC_URL,
    authentication,
    dependencies.limitedPartnershipController.getPageRoutingTermSic()
  );
  router.post(
    SIC_URL,
    authentication,
    dependencies.limitedPartnershipController.sendSicCodesPageData()
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
    dependencies.generalPartnerController.generalPartnerChoice()
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
    ADD_GENERAL_PARTNER_PERSON_WITH_ID_URL,
    authentication,
    dependencies.generalPartnerController.getPageRouting()
  );
  router.post(
    ADD_GENERAL_PARTNER_PERSON_WITH_ID_URL,
    authentication,
    dependencies.generalPartnerController.sendPageData()
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
    ADD_GENERAL_PARTNER_LEGAL_ENTITY_WITH_ID_URL,
    authentication,
    dependencies.generalPartnerController.getPageRouting()
  );
  router.post(
    ADD_GENERAL_PARTNER_LEGAL_ENTITY_WITH_ID_URL,
    authentication,
    dependencies.generalPartnerController.sendPageData()
  );

  router.get(
    REVIEW_GENERAL_PARTNERS_URL,
    authentication,
    dependencies.generalPartnerController.getReviewPage()
  );
  router.post(
    REVIEW_GENERAL_PARTNERS_URL,
    authentication,
    dependencies.generalPartnerController.postReviewPage()
  );

  router.get(
    REMOVE_GENERAL_PARTNER_URL,
    authentication,
    dependencies.generalPartnerController.getPageRouting()
  );
  router.post(
    REMOVE_GENERAL_PARTNER_URL,
    authentication,
    dependencies.generalPartnerController.postRemovePage()
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
    dependencies.limitedPartnerController.limitedPartnerChoice()
  );

  router.get(
    ADD_LIMITED_PARTNER_PERSON_URL,
    authentication,
    dependencies.limitedPartnerController.getPageRouting()
  );
  router.post(
    ADD_LIMITED_PARTNER_PERSON_URL,
    authentication,
    dependencies.limitedPartnerController.createLimitedPartner()
  );

  router.get(
    ADD_LIMITED_PARTNER_PERSON_WITH_ID_URL,
    authentication,
    dependencies.limitedPartnerController.getPageRouting()
  );
  router.post(
    ADD_LIMITED_PARTNER_PERSON_WITH_ID_URL,
    authentication,
    dependencies.limitedPartnerController.sendPageData()
  );

  router.get(
    ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
    authentication,
    dependencies.limitedPartnerController.getPageRouting()
  );
  router.post(
    ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
    authentication,
    dependencies.limitedPartnerController.createLimitedPartner()
  );

  router.get(
    ADD_LIMITED_PARTNER_LEGAL_ENTITY_WITH_ID_URL,
    authentication,
    dependencies.limitedPartnerController.getPageRouting()
  );
  router.post(
    ADD_LIMITED_PARTNER_LEGAL_ENTITY_WITH_ID_URL,
    authentication,
    dependencies.limitedPartnerController.sendPageData()
  );

  router.get(
    REVIEW_LIMITED_PARTNERS_URL,
    authentication,
    dependencies.limitedPartnerController.getReviewPage()
  );
  router.post(
    REVIEW_LIMITED_PARTNERS_URL,
    authentication,
    dependencies.limitedPartnerController.postReviewPage()
  );

  router.get(
    REMOVE_LIMITED_PARTNER_URL,
    authentication,
    dependencies.limitedPartnerController.getPageRouting()
  );
  router.post(
    REMOVE_LIMITED_PARTNER_URL,
    authentication,
    dependencies.limitedPartnerController.postRemovePage()
  );

  router.get(
    CHECK_YOUR_ANSWERS_URL,
    authentication,
    dependencies.limitedPartnershipController.getPageRouting()
  );

  router.post(
    CHECK_YOUR_ANSWERS_URL,
    authentication,
    dependencies.limitedPartnershipController.postCheckYourAnswers()
  );
};

export default registrationEndpoints;
