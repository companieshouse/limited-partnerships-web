import { Router } from "express";
import { PartnerKind, PartnershipKind } from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

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
  ENTER_REGISTERED_OFFICE_ADDRESS_WITH_IDS_URL,
  GENERAL_PARTNER_CHECK_YOUR_ANSWERS_URL,
  GENERAL_PARTNER_CHOICE_URL,
  LANDING_PAGE_URL,
  LIMITED_PARTNER_CHECK_YOUR_ANSWERS_URL,
  LIMITED_PARTNER_CHOICE_URL,
  PARTNERSHIP_NAME_URL,
  PARTNERSHIP_NAME_WITH_IDS_URL,
  PARTNERSHIP_NAME_CHANGE_CHECK_YOUR_ANSWERS_URL,
  REGISTERED_OFFICE_ADDRESS_CHANGE_CHECK_YOUR_ANSWERS_URL,
  TERM_URL,
  TERM_WITH_IDS_URL,
  WHEN_DID_THE_PARTNERSHIP_NAME_CHANGE_URL,
  WHEN_DID_THE_REGISTERED_OFFICE_ADDRESS_CHANGE_URL,
  WHEN_DID_THE_TERM_CHANGE_URL,
  TERM_CHANGE_CHECK_YOUR_ANSWERS_URL,
  ENTER_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  ENTER_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_WITH_IDS_URL,
  WHEN_DID_THE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_CHANGE_URL,
  PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_CHANGE_CHECK_YOUR_ANSWERS_URL,
  WHEN_DID_THE_GENERAL_PARTNER_PERSON_CEASE_URL,
  WHEN_DID_THE_GENERAL_PARTNER_PERSON_CEASE_WITH_IDS_URL,
  REMOVE_GENERAL_PARTNER_PERSON_CHECK_YOUR_ANSWERS_URL,
  WHEN_DID_THE_GENERAL_PARTNER_LEGAL_ENTITY_CEASE_URL,
  REMOVE_GENERAL_PARTNER_LEGAL_ENTITY_CHECK_YOUR_ANSWERS_URL
} from "../presentation/controller/postTransition/url";
import {
  TRANSACTION_DESCRIPTION_ADD_GENERAL_PARTNER_LEGAL_ENTITY,
  TRANSACTION_DESCRIPTION_ADD_GENERAL_PARTNER_PERSON,
  TRANSACTION_DESCRIPTION_REMOVE_GENERAL_PARTNER_LEGAL_ENTITY,
  TRANSACTION_DESCRIPTION_REMOVE_GENERAL_PARTNER_PERSON
} from "../config/constants";

const postTransitionEndpoints = (router: Router, dependencies: IDependencies): void => {
  router.get(COMPANY_NUMBER_URL, dependencies.limitedPartnershipPostTransitionController.getPageRouting());
  router.post(COMPANY_NUMBER_URL, dependencies.limitedPartnershipPostTransitionController.checkCompanyNumber());

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

  router.get(LANDING_PAGE_URL, dependencies.limitedPartnershipPostTransitionController.getCompanyPage());

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
    dependencies.generalPartnerPostTransitionController.createGeneralPartner({
      person: {
        description: TRANSACTION_DESCRIPTION_ADD_GENERAL_PARTNER_PERSON,
        kind: PartnerKind.ADD_GENERAL_PARTNER_PERSON
      },
      legalEntity: {
        description: TRANSACTION_DESCRIPTION_ADD_GENERAL_PARTNER_LEGAL_ENTITY,
        kind: PartnerKind.ADD_GENERAL_PARTNER_LEGAL_ENTITY
      }
    })
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
    dependencies.generalPartnerPostTransitionController.createGeneralPartner({
      person: {
        description: TRANSACTION_DESCRIPTION_ADD_GENERAL_PARTNER_PERSON,
        kind: PartnerKind.ADD_GENERAL_PARTNER_PERSON
      },
      legalEntity: {
        description: TRANSACTION_DESCRIPTION_ADD_GENERAL_PARTNER_LEGAL_ENTITY,
        kind: PartnerKind.ADD_GENERAL_PARTNER_LEGAL_ENTITY
      }
    })
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
    dependencies.limitedPartnershipPostTransitionController.create(
      PartnershipKind.UPDATE_PARTNERSHIP_REGISTERED_OFFICE_ADDRESS,
      "registered_office_address"
    )
  );

  router.get(
    ENTER_REGISTERED_OFFICE_ADDRESS_WITH_IDS_URL,
    companyAuthentication,
    dependencies.limitedPartnershipPostTransitionController.getPageRouting()
  );
  router.post(
    ENTER_REGISTERED_OFFICE_ADDRESS_WITH_IDS_URL,
    companyAuthentication,
    dependencies.limitedPartnershipPostTransitionController.sendPageData("registered_office_address")
  );

  router.get(
    WHEN_DID_THE_REGISTERED_OFFICE_ADDRESS_CHANGE_URL,
    companyAuthentication,
    dependencies.limitedPartnershipPostTransitionController.getDateOfUpdate()
  );
  router.post(
    WHEN_DID_THE_REGISTERED_OFFICE_ADDRESS_CHANGE_URL,
    companyAuthentication,
    dependencies.limitedPartnershipPostTransitionController.sendPageData()
  );

  router.get(
    REGISTERED_OFFICE_ADDRESS_CHANGE_CHECK_YOUR_ANSWERS_URL,
    companyAuthentication,
    dependencies.limitedPartnershipPostTransitionController.getCheckYourAnswersPageRouting()
  );
  router.post(
    REGISTERED_OFFICE_ADDRESS_CHANGE_CHECK_YOUR_ANSWERS_URL,
    companyAuthentication,
    dependencies.limitedPartnershipPostTransitionController.postCheckYourAnswers()
  );

  router.get(
    PARTNERSHIP_NAME_URL,
    companyAuthentication,
    dependencies.limitedPartnershipPostTransitionController.getPageRouting()
  );
  router.post(
    PARTNERSHIP_NAME_URL,
    companyAuthentication,
    dependencies.limitedPartnershipPostTransitionController.create(PartnershipKind.UPDATE_PARTNERSHIP_NAME)
  );

  router.get(
    PARTNERSHIP_NAME_WITH_IDS_URL,
    companyAuthentication,
    dependencies.limitedPartnershipPostTransitionController.getPageRouting()
  );
  router.post(
    PARTNERSHIP_NAME_WITH_IDS_URL,
    companyAuthentication,
    dependencies.limitedPartnershipPostTransitionController.sendPageData()
  );

  router.get(
    WHEN_DID_THE_PARTNERSHIP_NAME_CHANGE_URL,
    companyAuthentication,
    dependencies.limitedPartnershipPostTransitionController.getDateOfUpdate()
  );
  router.post(
    WHEN_DID_THE_PARTNERSHIP_NAME_CHANGE_URL,
    companyAuthentication,
    dependencies.limitedPartnershipPostTransitionController.sendPageData()
  );

  router.get(
    PARTNERSHIP_NAME_CHANGE_CHECK_YOUR_ANSWERS_URL,
    companyAuthentication,
    dependencies.limitedPartnershipPostTransitionController.getCheckYourAnswersPageRouting()
  );
  router.post(
    PARTNERSHIP_NAME_CHANGE_CHECK_YOUR_ANSWERS_URL,
    companyAuthentication,
    dependencies.limitedPartnershipPostTransitionController.postCheckYourAnswers(true)
  );

  router.get(TERM_URL, companyAuthentication, dependencies.limitedPartnershipPostTransitionController.getTermRouting());
  router.post(
    TERM_URL,
    companyAuthentication,
    dependencies.limitedPartnershipPostTransitionController.create(PartnershipKind.UPDATE_PARTNERSHIP_TERM)
  );

  router.get(
    TERM_WITH_IDS_URL,
    companyAuthentication,
    dependencies.limitedPartnershipPostTransitionController.getTermRouting()
  );
  router.post(
    TERM_WITH_IDS_URL,
    companyAuthentication,
    dependencies.limitedPartnershipPostTransitionController.sendPageData()
  );

  router.get(
    WHEN_DID_THE_TERM_CHANGE_URL,
    companyAuthentication,
    dependencies.limitedPartnershipPostTransitionController.getDateOfUpdate()
  );
  router.post(
    WHEN_DID_THE_TERM_CHANGE_URL,
    companyAuthentication,
    dependencies.limitedPartnershipPostTransitionController.sendPageData()
  );

  router.get(
    TERM_CHANGE_CHECK_YOUR_ANSWERS_URL,
    companyAuthentication,
    dependencies.limitedPartnershipPostTransitionController.getCheckYourAnswersPageRouting()
  );
  router.post(
    TERM_CHANGE_CHECK_YOUR_ANSWERS_URL,
    companyAuthentication,
    dependencies.limitedPartnershipPostTransitionController.postCheckYourAnswers()
  );

  router.get(
    ENTER_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
    companyAuthentication,
    dependencies.limitedPartnershipPostTransitionController.getPageRouting()
  );
  router.post(
    ENTER_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
    companyAuthentication,
    dependencies.limitedPartnershipPostTransitionController.create(
      PartnershipKind.UPDATE_PARTNERSHIP_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS,
      "principal_place_of_business_address"
    )
  );

  router.get(
    ENTER_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_WITH_IDS_URL,
    companyAuthentication,
    dependencies.limitedPartnershipPostTransitionController.getPageRouting()
  );
  router.post(
    ENTER_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_WITH_IDS_URL,
    companyAuthentication,
    dependencies.limitedPartnershipPostTransitionController.sendPageData("principal_place_of_business_address")
  );

  router.get(
    WHEN_DID_THE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_CHANGE_URL,
    companyAuthentication,
    dependencies.limitedPartnershipPostTransitionController.getDateOfUpdate()
  );
  router.post(
    WHEN_DID_THE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_CHANGE_URL,
    companyAuthentication,
    dependencies.limitedPartnershipPostTransitionController.sendPageData()
  );

  router.get(
    PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_CHANGE_CHECK_YOUR_ANSWERS_URL,
    companyAuthentication,
    dependencies.limitedPartnershipPostTransitionController.getCheckYourAnswersPageRouting()
  );
  router.post(
    PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_CHANGE_CHECK_YOUR_ANSWERS_URL,
    companyAuthentication,
    dependencies.limitedPartnershipPostTransitionController.postCheckYourAnswers()
  );

  // Remove General Partner
  router.get(
    WHEN_DID_THE_GENERAL_PARTNER_PERSON_CEASE_URL,
    companyAuthentication,
    dependencies.generalPartnerPostTransitionController.getCeaseDate()
  );
  router.post(
    WHEN_DID_THE_GENERAL_PARTNER_PERSON_CEASE_URL,
    companyAuthentication,
    dependencies.generalPartnerPostTransitionController.createGeneralPartner({
      person: {
        description: TRANSACTION_DESCRIPTION_REMOVE_GENERAL_PARTNER_PERSON,
        kind: PartnerKind.REMOVE_GENERAL_PARTNER_PERSON
      },
      legalEntity: {
        description: TRANSACTION_DESCRIPTION_REMOVE_GENERAL_PARTNER_LEGAL_ENTITY,
        kind: PartnerKind.REMOVE_GENERAL_PARTNER_LEGAL_ENTITY
      },
      needAppointment: true
    })
  );
  router.get(
    WHEN_DID_THE_GENERAL_PARTNER_PERSON_CEASE_WITH_IDS_URL,
    companyAuthentication,
    dependencies.generalPartnerPostTransitionController.getCeaseDate()
  );
  router.post(
    WHEN_DID_THE_GENERAL_PARTNER_PERSON_CEASE_WITH_IDS_URL,
    companyAuthentication,
    dependencies.generalPartnerPostTransitionController.sendPageData
  );

  router.get(
    REMOVE_GENERAL_PARTNER_PERSON_CHECK_YOUR_ANSWERS_URL,
    companyAuthentication,
    dependencies.generalPartnerPostTransitionController.getCheckYourAnswersPageRouting()
  );
  router.post(
    REMOVE_GENERAL_PARTNER_PERSON_CHECK_YOUR_ANSWERS_URL,
    companyAuthentication,
    dependencies.generalPartnerPostTransitionController.postCheckYourAnswers()
  );

  router.get(
    WHEN_DID_THE_GENERAL_PARTNER_LEGAL_ENTITY_CEASE_URL,
    companyAuthentication,
    dependencies.generalPartnerPostTransitionController.getCeaseDate()
  );
  router.post(
    WHEN_DID_THE_GENERAL_PARTNER_LEGAL_ENTITY_CEASE_URL,
    companyAuthentication,
    dependencies.generalPartnerPostTransitionController.createGeneralPartner({
      person: {
        description: TRANSACTION_DESCRIPTION_REMOVE_GENERAL_PARTNER_PERSON,
        kind: PartnerKind.REMOVE_GENERAL_PARTNER_PERSON
      },
      legalEntity: {
        description: TRANSACTION_DESCRIPTION_REMOVE_GENERAL_PARTNER_LEGAL_ENTITY,
        kind: PartnerKind.REMOVE_GENERAL_PARTNER_LEGAL_ENTITY
      },
      needAppointment: true
    })
  );

  router.get(
    REMOVE_GENERAL_PARTNER_LEGAL_ENTITY_CHECK_YOUR_ANSWERS_URL,
    companyAuthentication,
    dependencies.generalPartnerPostTransitionController.getCheckYourAnswersPageRouting()
  );
  router.post(
    REMOVE_GENERAL_PARTNER_LEGAL_ENTITY_CHECK_YOUR_ANSWERS_URL,
    companyAuthentication,
    dependencies.generalPartnerPostTransitionController.postCheckYourAnswers()
  );
};

export default postTransitionEndpoints;
