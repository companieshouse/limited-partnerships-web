import { Router } from "express";

import { companyAuthentication, transitionFiling } from "../middlewares";

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
  CHECK_YOUR_ANSWERS_URL,
  TRANSITION_START_URL,
  TRANSITION_ALREADY_FILED_URL
} from "../presentation/controller/transition/url";
import TransitionPageType from "../presentation/controller/transition/PageType";
import transitionsRouting from "../presentation/controller/transition/Routing";

const transitionEndpoints = (router: Router, dependencies: IDependencies): void => {
  router.get(
    TRANSITION_START_URL,
    (_req, res) => {
      res.redirect(CONTINUE_SAVED_FILING_URL);
    }
  );

  router.get(
    CONTINUE_SAVED_FILING_URL,
    dependencies.limitedPartnershipTransitionController.getPageRouting()
  );
  router.post(
    CONTINUE_SAVED_FILING_URL,
    dependencies.limitedPartnershipTransitionController.continueSavedFiling(TransitionPageType, transitionsRouting)
  );

  router.get(
    TRANSITION_ALREADY_FILED_URL,
    dependencies.limitedPartnershipTransitionController.getPageRouting()
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
    transitionFiling(dependencies),
    companyAuthentication,
    dependencies.limitedPartnershipTransitionController.getConfirmPage()
  );
  router.post(
    CONFIRM_LIMITED_PARTNERSHIP_URL,
    transitionFiling(dependencies),
    companyAuthentication,
    dependencies.limitedPartnershipTransitionController.limitedPartnershipConfirm()
  );

  router.get(
    EMAIL_URL,
    transitionFiling(dependencies),
    companyAuthentication,
    dependencies.limitedPartnershipTransitionController.getPageRouting()
  );
  router.post(
    EMAIL_URL,
    transitionFiling(dependencies),
    companyAuthentication,
    dependencies.limitedPartnershipTransitionController.sendPageData()
  );

  router.get(
    GENERAL_PARTNERS_URL,
    transitionFiling(dependencies),
    companyAuthentication,
    dependencies.generalPartnerTransitionController.getGeneralPartner()
  );

  router.get(
    GENERAL_PARTNER_CHOICE_URL,
    transitionFiling(dependencies),
    companyAuthentication,
    dependencies.generalPartnerTransitionController.getPageRouting()
  );
  router.post(
    GENERAL_PARTNER_CHOICE_URL,
    transitionFiling(dependencies),
    companyAuthentication,
    dependencies.generalPartnerTransitionController.generalPartnerChoice()
  );

  router.get(
    ADD_GENERAL_PARTNER_PERSON_URL,
    transitionFiling(dependencies),
    companyAuthentication,
    dependencies.generalPartnerTransitionController.getPageRouting()
  );
  router.post(
    ADD_GENERAL_PARTNER_PERSON_URL,
    transitionFiling(dependencies),
    companyAuthentication,
    dependencies.generalPartnerTransitionController.createGeneralPartner()
  );

  router.get(
    ADD_GENERAL_PARTNER_PERSON_WITH_ID_URL,
    transitionFiling(dependencies),
    companyAuthentication,
    dependencies.generalPartnerTransitionController.getPageRouting()
  );
  router.post(
    ADD_GENERAL_PARTNER_PERSON_WITH_ID_URL,
    transitionFiling(dependencies),
    companyAuthentication,
    dependencies.generalPartnerTransitionController.sendPageData()
  );

  router.get(
    ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
    transitionFiling(dependencies),
    companyAuthentication,
    dependencies.generalPartnerTransitionController.getPageRouting()
  );
  router.post(
    ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
    transitionFiling(dependencies),
    companyAuthentication,
    dependencies.generalPartnerTransitionController.createGeneralPartner()
  );

  router.get(
    ADD_GENERAL_PARTNER_LEGAL_ENTITY_WITH_ID_URL,
    transitionFiling(dependencies),
    companyAuthentication,
    dependencies.generalPartnerTransitionController.getPageRouting()
  );
  router.post(
    ADD_GENERAL_PARTNER_LEGAL_ENTITY_WITH_ID_URL,
    transitionFiling(dependencies),
    companyAuthentication,
    dependencies.generalPartnerTransitionController.sendPageData()
  );

  router.get(
    REVIEW_GENERAL_PARTNERS_URL,
    transitionFiling(dependencies),
    companyAuthentication,
    dependencies.generalPartnerTransitionController.getReviewPage()
  );
  router.post(
    REVIEW_GENERAL_PARTNERS_URL,
    transitionFiling(dependencies),
    companyAuthentication,
    dependencies.generalPartnerTransitionController.postReviewPage()
  );

  router.get(
    REMOVE_GENERAL_PARTNER_URL,
    transitionFiling(dependencies),
    companyAuthentication,
    dependencies.generalPartnerTransitionController.getPageRouting()
  );
  router.post(
    REMOVE_GENERAL_PARTNER_URL,
    transitionFiling(dependencies),
    companyAuthentication,
    dependencies.generalPartnerTransitionController.postRemovePage()
  );

  router.get(
    LIMITED_PARTNERS_URL,
    transitionFiling(dependencies),
    companyAuthentication,
    dependencies.limitedPartnerTransitionController.getLimitedPartner()
  );

  router.get(
    LIMITED_PARTNER_CHOICE_URL,
    transitionFiling(dependencies),
    companyAuthentication,
    dependencies.limitedPartnerTransitionController.getPageRouting()
  );
  router.post(
    LIMITED_PARTNER_CHOICE_URL,
    transitionFiling(dependencies),
    companyAuthentication,
    dependencies.limitedPartnerTransitionController.limitedPartnerChoice()
  );

  router.get(
    ADD_LIMITED_PARTNER_PERSON_URL,
    transitionFiling(dependencies),
    companyAuthentication,
    dependencies.limitedPartnerTransitionController.getPageRouting()
  );
  router.post(
    ADD_LIMITED_PARTNER_PERSON_URL,
    transitionFiling(dependencies),
    companyAuthentication,
    dependencies.limitedPartnerTransitionController.createLimitedPartner()
  );

  router.get(
    ADD_LIMITED_PARTNER_PERSON_WITH_ID_URL,
    transitionFiling(dependencies),
    companyAuthentication,
    dependencies.limitedPartnerTransitionController.getPageRouting()
  );
  router.post(
    ADD_LIMITED_PARTNER_PERSON_WITH_ID_URL,
    transitionFiling(dependencies),
    companyAuthentication,
    dependencies.limitedPartnerTransitionController.sendPageData()
  );

  router.get(
    ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
    transitionFiling(dependencies),
    companyAuthentication,
    dependencies.limitedPartnerTransitionController.getPageRouting()
  );
  router.post(
    ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
    transitionFiling(dependencies),
    companyAuthentication,
    dependencies.limitedPartnerTransitionController.createLimitedPartner()
  );

  router.get(
    ADD_LIMITED_PARTNER_LEGAL_ENTITY_WITH_ID_URL,
    transitionFiling(dependencies),
    companyAuthentication,
    dependencies.limitedPartnerTransitionController.getPageRouting()
  );
  router.post(
    ADD_LIMITED_PARTNER_LEGAL_ENTITY_WITH_ID_URL,
    transitionFiling(dependencies),
    companyAuthentication,
    dependencies.limitedPartnerTransitionController.sendPageData()
  );

  router.get(
    REVIEW_LIMITED_PARTNERS_URL,
    transitionFiling(dependencies),
    companyAuthentication,
    dependencies.limitedPartnerTransitionController.getReviewPage()
  );
  router.post(
    REVIEW_LIMITED_PARTNERS_URL,
    transitionFiling(dependencies),
    companyAuthentication,
    dependencies.limitedPartnerTransitionController.postReviewPage()
  );

  router.get(
    REMOVE_LIMITED_PARTNER_URL,
    transitionFiling(dependencies),
    companyAuthentication,
    dependencies.limitedPartnerTransitionController.getPageRouting()
  );
  router.post(
    REMOVE_LIMITED_PARTNER_URL,
    transitionFiling(dependencies),
    companyAuthentication,
    dependencies.limitedPartnerTransitionController.postRemovePage()
  );

  router.get(
    CHECK_YOUR_ANSWERS_URL,
    transitionFiling(dependencies),
    companyAuthentication,
    dependencies.limitedPartnershipTransitionController.getPageRouting()
  );
  router.post(
    CHECK_YOUR_ANSWERS_URL,
    transitionFiling(dependencies),
    companyAuthentication,
    dependencies.limitedPartnershipTransitionController.postCheckYourAnswers()
  );
};

export default transitionEndpoints;
