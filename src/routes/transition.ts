import { Router } from "express";

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
  CONTINUE_SAVED_FILING_URL,
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
import TransitionPageType from "../presentation/controller/transition/PageType";
import transitionsRouting from "../presentation/controller/transition/Routing";

const transitionEndpoints = (router: Router, dependencies: IDependencies): void => {
  router.get(
    CONTINUE_SAVED_FILING_URL,
    dependencies.limitedPartnershipTransitionController.getPageRouting()
  );
  router.post(
    CONTINUE_SAVED_FILING_URL,
    dependencies.limitedPartnershipTransitionController.continueSavedFiling(TransitionPageType, transitionsRouting)
  );

  router.get(
    COMPANY_NUMBER_URL,
    dependencies.limitedPartnershipTransitionController.getPageRouting()
  );
  router.post(
    COMPANY_NUMBER_URL,
    dependencies.limitedPartnershipTransitionController.checkCompanyNumber()
  );

  router.get(
    CONFIRM_LIMITED_PARTNERSHIP_URL,
    dependencies.limitedPartnershipTransitionController.getConfirmPage()
  );
  router.post(
    CONFIRM_LIMITED_PARTNERSHIP_URL,
    dependencies.limitedPartnershipTransitionController.limitedPartnershipConfirm()
  );

  router.get(
    EMAIL_URL,
    dependencies.limitedPartnershipTransitionController.getPageRouting()
  );
  router.post(
    EMAIL_URL,
    dependencies.limitedPartnershipTransitionController.sendPageData()
  );

  router.get(
    GENERAL_PARTNERS_URL,
    dependencies.generalPartnerTransitionController.getGeneralPartner()
  );

  router.get(
    GENERAL_PARTNER_CHOICE_URL,
    dependencies.generalPartnerTransitionController.getPageRouting()
  );
  router.post(
    GENERAL_PARTNER_CHOICE_URL,
    dependencies.generalPartnerTransitionController.generalPartnerChoice()
  );

  router.get(
    ADD_GENERAL_PARTNER_PERSON_URL,
    dependencies.generalPartnerTransitionController.getPageRouting()
  );
  router.post(
    ADD_GENERAL_PARTNER_PERSON_URL,
    dependencies.generalPartnerTransitionController.createGeneralPartner()
  );

  router.get(
    ADD_GENERAL_PARTNER_PERSON_WITH_ID_URL,
    dependencies.generalPartnerTransitionController.getPageRouting()
  );
  router.post(
    ADD_GENERAL_PARTNER_PERSON_WITH_ID_URL,
    dependencies.generalPartnerTransitionController.sendPageData()
  );

  router.get(
    ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
    dependencies.generalPartnerTransitionController.getPageRouting()
  );
  router.post(
    ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
    dependencies.generalPartnerTransitionController.createGeneralPartner()
  );

  router.get(
    ADD_GENERAL_PARTNER_LEGAL_ENTITY_WITH_ID_URL,
    dependencies.generalPartnerTransitionController.getPageRouting()
  );
  router.post(
    ADD_GENERAL_PARTNER_LEGAL_ENTITY_WITH_ID_URL,
    dependencies.generalPartnerTransitionController.sendPageData()
  );

  router.get(
    REVIEW_GENERAL_PARTNERS_URL,
    dependencies.generalPartnerTransitionController.getReviewPage()
  );
  router.post(
    REVIEW_GENERAL_PARTNERS_URL,
    dependencies.generalPartnerTransitionController.postReviewPage()
  );

  router.get(
    REMOVE_GENERAL_PARTNER_URL,
    dependencies.generalPartnerTransitionController.getPageRouting()
  );
  router.post(
    REMOVE_GENERAL_PARTNER_URL,
    dependencies.generalPartnerTransitionController.postRemovePage()
  );

  router.get(
    LIMITED_PARTNERS_URL,
    dependencies.limitedPartnerTransitionController.getLimitedPartner()
  );

  router.get(
    LIMITED_PARTNER_CHOICE_URL,
    dependencies.limitedPartnerTransitionController.getPageRouting()
  );
  router.post(
    LIMITED_PARTNER_CHOICE_URL,
    dependencies.limitedPartnerTransitionController.limitedPartnerChoice()
  );

  router.get(
    ADD_LIMITED_PARTNER_PERSON_URL,
    dependencies.limitedPartnerTransitionController.getPageRouting()
  );
  router.post(
    ADD_LIMITED_PARTNER_PERSON_URL,
    dependencies.limitedPartnerTransitionController.createLimitedPartner()
  );

  router.get(
    ADD_LIMITED_PARTNER_PERSON_WITH_ID_URL,
    dependencies.limitedPartnerTransitionController.getPageRouting()
  );
  router.post(
    ADD_LIMITED_PARTNER_PERSON_WITH_ID_URL,
    dependencies.limitedPartnerTransitionController.sendPageData()
  );

  router.get(
    ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
    dependencies.limitedPartnerTransitionController.getPageRouting()
  );
  router.post(
    ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
    dependencies.limitedPartnerTransitionController.createLimitedPartner()
  );

  router.get(
    ADD_LIMITED_PARTNER_LEGAL_ENTITY_WITH_ID_URL,
    dependencies.limitedPartnerTransitionController.getPageRouting()
  );
  router.post(
    ADD_LIMITED_PARTNER_LEGAL_ENTITY_WITH_ID_URL,
    dependencies.limitedPartnerTransitionController.sendPageData()
  );

  router.get(
    REVIEW_LIMITED_PARTNERS_URL,
    dependencies.limitedPartnerTransitionController.getReviewPage()
  );
  router.post(
    REVIEW_LIMITED_PARTNERS_URL,
    dependencies.limitedPartnerTransitionController.postReviewPage()
  );

  router.get(
    REMOVE_LIMITED_PARTNER_URL,
    dependencies.limitedPartnerTransitionController.getPageRouting()
  );
  router.post(
    REMOVE_LIMITED_PARTNER_URL,
    dependencies.limitedPartnerTransitionController.postRemovePage()
  );

  router.get(
    CHECK_YOUR_ANSWERS_URL,
    dependencies.limitedPartnershipTransitionController.getPageRouting()
  );
};

export default transitionEndpoints;
