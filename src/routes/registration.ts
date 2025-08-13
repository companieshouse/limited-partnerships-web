import { Router } from "express";

import { IDependencies } from "../config/IDependencies";

import {
  EMAIL_URL,
  WHERE_IS_THE_JURISDICTION_URL,
  NAME_URL,
  CONTINUE_SAVED_FILING_URL,
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
  REMOVE_LIMITED_PARTNER_URL,
  REGISTRATION_START_URL
} from "../presentation/controller/registration/url";
import RegistrationPageType from "../presentation/controller/registration/PageType";
import registrationsRouting from "../presentation/controller/registration/Routing";

export const registrationEndpoints = (
  router: Router,
  dependencies: IDependencies
): void => {
  router.get(
    REGISTRATION_START_URL,
    (_req, res) => {
      res.redirect(CONTINUE_SAVED_FILING_URL);
    }
  );

  router.get(
    CONTINUE_SAVED_FILING_URL,
    dependencies.limitedPartnershipRegistrationController.getPageRouting()
  );
  router.post(
    CONTINUE_SAVED_FILING_URL,
    dependencies.limitedPartnershipRegistrationController.continueSavedFiling(RegistrationPageType, registrationsRouting)
  );

  router.get(
    WHICH_TYPE_URL,
    dependencies.limitedPartnershipRegistrationController.getPageRouting()
  );
  router.post(
    WHICH_TYPE_URL,
    dependencies.limitedPartnershipRegistrationController.redirectAndCacheSelection()
  );

  router.get(
    WHICH_TYPE_WITH_IDS_URL,
    dependencies.limitedPartnershipRegistrationController.getPageRouting()
  );
  router.post(
    WHICH_TYPE_WITH_IDS_URL,
    dependencies.limitedPartnershipRegistrationController.redirectWhichTypeWithIds()
  );

  router.get(
    NAME_URL,
    dependencies.limitedPartnershipRegistrationController.getPageRouting()
  );
  router.post(
    NAME_URL,
    dependencies.limitedPartnershipRegistrationController.createTransactionAndFirstSubmission()
  );

  router.get(
    NAME_WITH_IDS_URL,
    dependencies.limitedPartnershipRegistrationController.getPageRouting()
  );
  router.post(
    NAME_WITH_IDS_URL,
    dependencies.limitedPartnershipRegistrationController.sendPageData()
  );

  router.get(
    EMAIL_URL,
    dependencies.limitedPartnershipRegistrationController.getPageRouting()
  );
  router.post(
    EMAIL_URL,
    dependencies.limitedPartnershipRegistrationController.sendPageData()
  );

  router.get(
    WHERE_IS_THE_JURISDICTION_URL,
    dependencies.limitedPartnershipRegistrationController.getPageRouting()
  );
  router.post(
    WHERE_IS_THE_JURISDICTION_URL,
    dependencies.limitedPartnershipRegistrationController.sendPageData()
  );

  router.get(
    TERM_URL,
    dependencies.limitedPartnershipRegistrationController.getPageRoutingTermSic()
  );
  router.post(
    TERM_URL,
    dependencies.limitedPartnershipRegistrationController.sendPageData()
  );

  router.get(
    SIC_URL,
    dependencies.limitedPartnershipRegistrationController.getPageRoutingTermSic()
  );
  router.post(
    SIC_URL,
    dependencies.limitedPartnershipRegistrationController.sendSicCodesPageData()
  );

  router.get(
    GENERAL_PARTNERS_URL,
    dependencies.generalPartnerRegistrationController.getGeneralPartner()
  );

  router.get(
    GENERAL_PARTNER_CHOICE_URL,
    dependencies.generalPartnerRegistrationController.getPageRouting()
  );
  router.post(
    GENERAL_PARTNER_CHOICE_URL,
    dependencies.generalPartnerRegistrationController.generalPartnerChoice()
  );

  router.get(
    ADD_GENERAL_PARTNER_PERSON_URL,
    dependencies.generalPartnerRegistrationController.getPageRouting()
  );
  router.post(
    ADD_GENERAL_PARTNER_PERSON_URL,
    dependencies.generalPartnerRegistrationController.createGeneralPartner()
  );

  router.get(
    ADD_GENERAL_PARTNER_PERSON_WITH_ID_URL,
    dependencies.generalPartnerRegistrationController.getPageRouting()
  );
  router.post(
    ADD_GENERAL_PARTNER_PERSON_WITH_ID_URL,
    dependencies.generalPartnerRegistrationController.sendPageData()
  );

  router.get(
    ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
    dependencies.generalPartnerRegistrationController.getPageRouting()
  );
  router.post(
    ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
    dependencies.generalPartnerRegistrationController.createGeneralPartner()
  );

  router.get(
    ADD_GENERAL_PARTNER_LEGAL_ENTITY_WITH_ID_URL,
    dependencies.generalPartnerRegistrationController.getPageRouting()
  );
  router.post(
    ADD_GENERAL_PARTNER_LEGAL_ENTITY_WITH_ID_URL,
    dependencies.generalPartnerRegistrationController.sendPageData()
  );

  router.get(
    REVIEW_GENERAL_PARTNERS_URL,
    dependencies.generalPartnerRegistrationController.getReviewPage()
  );
  router.post(
    REVIEW_GENERAL_PARTNERS_URL,
    dependencies.generalPartnerRegistrationController.postReviewPage()
  );

  router.get(
    REMOVE_GENERAL_PARTNER_URL,
    dependencies.generalPartnerRegistrationController.getPageRouting()
  );
  router.post(
    REMOVE_GENERAL_PARTNER_URL,
    dependencies.generalPartnerRegistrationController.postRemovePage()
  );

  router.get(
    LIMITED_PARTNERS_URL,
    dependencies.limitedPartnerRegistrationController.getLimitedPartner()
  );

  router.get(
    LIMITED_PARTNER_CHOICE_URL,
    dependencies.limitedPartnerRegistrationController.getPageRouting()
  );
  router.post(
    LIMITED_PARTNER_CHOICE_URL,
    dependencies.limitedPartnerRegistrationController.limitedPartnerChoice()
  );

  router.get(
    ADD_LIMITED_PARTNER_PERSON_URL,
    dependencies.limitedPartnerRegistrationController.getPageRouting()
  );
  router.post(
    ADD_LIMITED_PARTNER_PERSON_URL,
    dependencies.limitedPartnerRegistrationController.createLimitedPartner()
  );

  router.get(
    ADD_LIMITED_PARTNER_PERSON_WITH_ID_URL,
    dependencies.limitedPartnerRegistrationController.getPageRouting()
  );
  router.post(
    ADD_LIMITED_PARTNER_PERSON_WITH_ID_URL,
    dependencies.limitedPartnerRegistrationController.sendPageData()
  );

  router.get(
    ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
    dependencies.limitedPartnerRegistrationController.getPageRouting()
  );
  router.post(
    ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
    dependencies.limitedPartnerRegistrationController.createLimitedPartner()
  );

  router.get(
    ADD_LIMITED_PARTNER_LEGAL_ENTITY_WITH_ID_URL,
    dependencies.limitedPartnerRegistrationController.getPageRouting()
  );
  router.post(
    ADD_LIMITED_PARTNER_LEGAL_ENTITY_WITH_ID_URL,
    dependencies.limitedPartnerRegistrationController.sendPageData()
  );

  router.get(
    REVIEW_LIMITED_PARTNERS_URL,
    dependencies.limitedPartnerRegistrationController.getReviewPage()
  );
  router.post(
    REVIEW_LIMITED_PARTNERS_URL,
    dependencies.limitedPartnerRegistrationController.postReviewPage()
  );

  router.get(
    REMOVE_LIMITED_PARTNER_URL,
    dependencies.limitedPartnerRegistrationController.getPageRouting()
  );
  router.post(
    REMOVE_LIMITED_PARTNER_URL,
    dependencies.limitedPartnerRegistrationController.postRemovePage()
  );

  router.get(
    CHECK_YOUR_ANSWERS_URL,
    dependencies.limitedPartnershipRegistrationController.getPageRouting()
  );

  router.post(
    CHECK_YOUR_ANSWERS_URL,
    dependencies.limitedPartnershipRegistrationController.postCheckYourAnswers()
  );
};

export default registrationEndpoints;
