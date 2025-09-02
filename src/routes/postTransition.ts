import { Router } from "express";

import { companyAuthentication } from "../middlewares";

import { IDependencies } from "../config/IDependencies";

import {
  ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  ADD_GENERAL_PARTNER_LEGAL_ENTITY_WITH_IDS_URL,
  ADD_GENERAL_PARTNER_PERSON_URL,
  ADD_GENERAL_PARTNER_PERSON_WITH_IDS_URL,
  ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
  ADD_LIMITED_PARTNER_LEGAL_ENTITY_WITH_IDS_URL,
  ADD_LIMITED_PARTNER_PERSON_URL,
  ADD_LIMITED_PARTNER_PERSON_WITH_IDS_URL,
  COMPANY_NUMBER_URL,
  CONFIRM_LIMITED_PARTNERSHIP_URL,
  ENTER_REGISTERED_OFFICE_ADDRESS_URL,
  ENTER_REGISTERED_OFFICE_ADDRESS_WITH_ALL_IDS_URL,
  GENERAL_PARTNER_CHECK_YOUR_ANSWERS_URL,
  GENERAL_PARTNER_CHOICE_URL,
  LANDING_PAGE_URL,
  LIMITED_PARTNER_CHECK_YOUR_ANSWERS_URL,
  LIMITED_PARTNER_CHOICE_URL,
  WHEN_REGISTERED_OFFICE_ADDRESS_CHANGE_URL
} from "../presentation/controller/postTransition/url";

const postTransitionEndpoints = (router: Router, dependencies: IDependencies): void => {

  router.get(
    COMPANY_NUMBER_URL,
    dependencies.limitedPartnershipPostTransitionController.getPageRouting()
  );
  router.post(
    COMPANY_NUMBER_URL,
    dependencies.limitedPartnershipPostTransitionController.checkCompanyNumber()
  );

  router.get(
    CONFIRM_LIMITED_PARTNERSHIP_URL,
    companyAuthentication,
    dependencies.limitedPartnershipPostTransitionController.getCompanyPage()
  );
  router.post(
    CONFIRM_LIMITED_PARTNERSHIP_URL,
    companyAuthentication,
    dependencies.limitedPartnershipPostTransitionController.limitedPartnershipConfirm()
  );

  router.get(
    LANDING_PAGE_URL,
    dependencies.limitedPartnershipPostTransitionController.getCompanyPage()
  );

  router.get(
    WHEN_REGISTERED_OFFICE_ADDRESS_CHANGE_URL,
    companyAuthentication,
    dependencies.limitedPartnershipPostTransitionController.getPageRouting()
  );
  router.post(
    WHEN_REGISTERED_OFFICE_ADDRESS_CHANGE_URL,
    companyAuthentication,
    // dependencies.limitedPartnershipPostTransitionController.createTransactionAndFirstSubmission()
  );

  router.get(
    GENERAL_PARTNER_CHOICE_URL,
    companyAuthentication,
    dependencies.generalPartnerPostTransitionController.getPageRouting()
  );
  router.post(
    GENERAL_PARTNER_CHOICE_URL,
    companyAuthentication,
    dependencies.generalPartnerPostTransitionController.generalPartnerChoice()
  );

  router.get(
    ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
    companyAuthentication,
    dependencies.generalPartnerPostTransitionController.getPageRouting()
  );
  router.post(
    ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
    companyAuthentication,
    dependencies.generalPartnerPostTransitionController.createGeneralPartner()
  );

  router.get(
    ADD_GENERAL_PARTNER_LEGAL_ENTITY_WITH_IDS_URL,
    companyAuthentication,
    dependencies.generalPartnerPostTransitionController.getPageRouting()
  );
  router.post(
    ADD_GENERAL_PARTNER_LEGAL_ENTITY_WITH_IDS_URL,
    companyAuthentication,
    dependencies.generalPartnerPostTransitionController.sendPageData()
  );

  router.get(
    ADD_GENERAL_PARTNER_PERSON_URL,
    companyAuthentication,
    dependencies.generalPartnerPostTransitionController.getPageRouting()
  );
  router.post(
    ADD_GENERAL_PARTNER_PERSON_URL,
    companyAuthentication,
    dependencies.generalPartnerPostTransitionController.createGeneralPartner()
  );

  router.get(
    ADD_GENERAL_PARTNER_PERSON_WITH_IDS_URL,
    companyAuthentication,
    dependencies.generalPartnerPostTransitionController.getPageRouting()
  );
  router.post(
    ADD_GENERAL_PARTNER_PERSON_WITH_IDS_URL,
    companyAuthentication,
    dependencies.generalPartnerPostTransitionController.sendPageData()
  );

  router.get(
    GENERAL_PARTNER_CHECK_YOUR_ANSWERS_URL,
    companyAuthentication,
    dependencies.generalPartnerPostTransitionController.getPageRouting()
  );
  router.post(
    GENERAL_PARTNER_CHECK_YOUR_ANSWERS_URL,
    companyAuthentication,
    dependencies.generalPartnerPostTransitionController.postCheckYourAnswers()
  );

  // Limited Partner

  router.get(
    LIMITED_PARTNER_CHOICE_URL,
    companyAuthentication,
    dependencies.limitedPartnerPostTransitionController.getPageRouting()
  );
  router.post(
    LIMITED_PARTNER_CHOICE_URL,
    companyAuthentication,
    dependencies.limitedPartnerPostTransitionController.limitedPartnerChoice()
  );

  router.get(
    ADD_LIMITED_PARTNER_PERSON_URL,
    companyAuthentication,
    dependencies.limitedPartnerPostTransitionController.getPageRouting()
  );
  router.post(
    ADD_LIMITED_PARTNER_PERSON_URL,
    companyAuthentication,
    dependencies.limitedPartnerPostTransitionController.createLimitedPartner()
  );

  router.get(
    ADD_LIMITED_PARTNER_PERSON_WITH_IDS_URL,
    companyAuthentication,
    dependencies.limitedPartnerPostTransitionController.getPageRouting()
  );
  router.post(
    ADD_LIMITED_PARTNER_PERSON_WITH_IDS_URL,
    companyAuthentication,
    dependencies.limitedPartnerPostTransitionController.sendPageData()
  );

  router.get(
    ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
    companyAuthentication,
    dependencies.limitedPartnerPostTransitionController.getPageRouting()
  );
  router.post(
    ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
    companyAuthentication,
    dependencies.limitedPartnerPostTransitionController.createLimitedPartner()
  );

  router.get(
    ADD_LIMITED_PARTNER_LEGAL_ENTITY_WITH_IDS_URL,
    companyAuthentication,
    dependencies.limitedPartnerPostTransitionController.getPageRouting()
  );
  router.post(
    ADD_LIMITED_PARTNER_LEGAL_ENTITY_WITH_IDS_URL,
    companyAuthentication,
    dependencies.limitedPartnerPostTransitionController.sendPageData()
  );

  router.get(
    LIMITED_PARTNER_CHECK_YOUR_ANSWERS_URL,
    companyAuthentication,
    dependencies.limitedPartnerPostTransitionController.getPageRouting()
  );
  router.post(
    LIMITED_PARTNER_CHECK_YOUR_ANSWERS_URL,
    companyAuthentication,
    dependencies.limitedPartnerPostTransitionController.postCheckYourAnswers()
  );

  // Limited Partnership
  router.get(
    ENTER_REGISTERED_OFFICE_ADDRESS_URL,
    companyAuthentication,
    dependencies.limitedPartnershipPostTransitionController.getPageRouting()
  );
  router.post(
    ENTER_REGISTERED_OFFICE_ADDRESS_URL,
    companyAuthentication,
    dependencies.limitedPartnershipPostTransitionController.createRegisteredOfficeAddress()
  );

  router.get(
    ENTER_REGISTERED_OFFICE_ADDRESS_WITH_ALL_IDS_URL,
    companyAuthentication,
    dependencies.limitedPartnershipPostTransitionController.getPageRouting()
  );
  router.post(
    ENTER_REGISTERED_OFFICE_ADDRESS_WITH_ALL_IDS_URL,
    companyAuthentication,
    dependencies.limitedPartnershipPostTransitionController.sendPageData()
  );
};

export default postTransitionEndpoints;
