import { Router } from "express";

import { authentication } from "../middlewares";

import { IDependencies } from "../config/IDependencies";

import {
  ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  ADD_GENERAL_PARTNER_LEGAL_ENTITY_WITH_ID_URL,
  ADD_GENERAL_PARTNER_PERSON_URL,
  ADD_GENERAL_PARTNER_PERSON_WITH_ID_URL,
  ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
  ADD_LIMITED_PARTNER_LEGAL_ENTITY_WITH_ID_URL,
  ADD_LIMITED_PARTNER_PERSON_URL,
  ADD_LIMITED_PARTNER_PERSON_WITH_ID_URL,
  COMPANY_NUMBER_URL,
  CONFIRM_LIMITED_PARTNERSHIP_URL,
  EMAIL_URL,
  GENERAL_PARTNER_CHOICE_URL,
  GENERAL_PARTNERS_URL,
  LIMITED_PARTNER_CHOICE_URL,
  LIMITED_PARTNERS_URL,
  REMOVE_GENERAL_PARTNER_URL,
  REMOVE_LIMITED_PARTNER_URL,
  REVIEW_GENERAL_PARTNERS_URL,
  REVIEW_LIMITED_PARTNERS_URL,
  CHECK_YOUR_ANSWERS_URL
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

  router.get(
    REVIEW_GENERAL_PARTNERS_URL,
    authentication,
    dependencies.generalPartnerTransitionController.getReviewPage()
  );
  router.post(
    REVIEW_GENERAL_PARTNERS_URL,
    authentication,
    dependencies.generalPartnerTransitionController.postReviewPage()
  );

  router.get(
    REMOVE_GENERAL_PARTNER_URL,
    authentication,
    dependencies.generalPartnerTransitionController.getPageRouting()
  );
  router.post(
    REMOVE_GENERAL_PARTNER_URL,
    authentication,
    dependencies.generalPartnerTransitionController.postRemovePage()
  );

  router.get(
    LIMITED_PARTNERS_URL,
    authentication,
    dependencies.limitedPartnershipTransitionController.getPageRouting()
  );

  router.get(
    LIMITED_PARTNER_CHOICE_URL,
    authentication,
    dependencies.limitedPartnershipTransitionController.getPageRouting()
  );
  router.post(
    LIMITED_PARTNER_CHOICE_URL,
    authentication,
    dependencies.limitedPartnerTransitionController.limitedPartnerChoice()
  );

  router.get(
    ADD_LIMITED_PARTNER_PERSON_URL,
    authentication,
    dependencies.limitedPartnerTransitionController.getPageRouting()
  );
  router.post(
    ADD_LIMITED_PARTNER_PERSON_URL,
    authentication,
    dependencies.limitedPartnerTransitionController.createLimitedPartner()
  );

  router.get(
    ADD_LIMITED_PARTNER_PERSON_WITH_ID_URL,
    authentication,
    dependencies.limitedPartnerTransitionController.getPageRouting()
  );
  router.post(
    ADD_LIMITED_PARTNER_PERSON_WITH_ID_URL,
    authentication,
    dependencies.limitedPartnerTransitionController.sendPageData()
  );

  router.get(
    ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
    authentication,
    dependencies.limitedPartnerTransitionController.getPageRouting()
  );
  router.post(
    ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
    authentication,
    dependencies.limitedPartnerTransitionController.createLimitedPartner()
  );

  router.get(
    ADD_LIMITED_PARTNER_LEGAL_ENTITY_WITH_ID_URL,
    authentication,
    dependencies.limitedPartnerTransitionController.getPageRouting()
  );
  router.post(
    ADD_LIMITED_PARTNER_LEGAL_ENTITY_WITH_ID_URL,
    authentication,
    dependencies.limitedPartnerTransitionController.sendPageData()
  );

  router.get(
    REVIEW_LIMITED_PARTNERS_URL,
    authentication,
    dependencies.limitedPartnerTransitionController.getReviewPage()
  );
  router.post(
    REVIEW_LIMITED_PARTNERS_URL,
    authentication,
    dependencies.limitedPartnerTransitionController.postReviewPage()
  );

  router.get(
    REMOVE_LIMITED_PARTNER_URL,
    authentication,
    dependencies.limitedPartnerTransitionController.getPageRouting()
  );
  router.post(
    REMOVE_LIMITED_PARTNER_URL,
    authentication,
    dependencies.limitedPartnerTransitionController.postRemovePage()
  );

  router.get(
    CHECK_YOUR_ANSWERS_URL,
    authentication,
    dependencies.limitedPartnershipTransitionController.getPageRouting()
  );
  router.post(
    CHECK_YOUR_ANSWERS_URL,
    authentication,
    dependencies.limitedPartnershipTransitionController.postCheckYourAnswers()
  );
};

export default transitionEndpoints;
