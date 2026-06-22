import RegistrationPageType from "../PageType";
import * as url from "../url";
import {
  CONFIRM_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_USUAL_RESIDENTIAL_ADDRESS_URL,
  CONFIRM_PERSON_WITH_SIGNIFICANT_CONTROL_OTHER_REGISTRABLE_PERSON_PRINCIPAL_OFFICE_ADDRESS_URL,
  CONFIRM_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_PRINCIPAL_OFFICE_ADDRESS_URL,
  TERRITORY_CHOICE_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_USUAL_RESIDENTIAL_ADDRESS_URL,
  TERRITORY_CHOICE_PERSON_WITH_SIGNIFICANT_CONTROL_OTHER_REGISTRABLE_PERSON_PRINCIPAL_OFFICE_ADDRESS_URL,
  TERRITORY_CHOICE_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_PRINCIPAL_OFFICE_ADDRESS_URL
} from "../../addressLookUp/url/registration";
import {
  NatureOfControlType,
  PersonWithSignificantControlType
} from "@companieshouse/api-sdk-node/dist/services/limited-partnerships/types";

const registrationRoutingPersonWithSignificantControl = {
  previousUrl: url.REVIEW_LIMITED_PARTNERS_URL,
  currentUrl: url.TELL_US_ABOUT_PSC_URL,
  nextUrl: url.WILL_LIMITED_PARTNERSHIP_HAVE_PSC_URL,
  pageType: RegistrationPageType.tellUsAboutPscPage
};

const registrationRoutingWillLimitedPartnershipHavePsc = {
  previousUrl: url.TELL_US_ABOUT_PSC_URL,
  currentUrl: url.WILL_LIMITED_PARTNERSHIP_HAVE_PSC_URL,
  nextUrl: "",
  pageType: RegistrationPageType.willLimitedPartnershipHavePsc
};

const registrationRoutingPersonWithSignificantControlChoice = {
  previousUrl: url.WILL_LIMITED_PARTNERSHIP_HAVE_PSC_URL,
  currentUrl: url.PERSON_WITH_SIGNIFICANT_CONTROL_CHOICE_URL,
  nextUrl: "",
  pageType: RegistrationPageType.personWithSignificantControlChoice
};

// RELEVANT LEGAL ENTITY

const registrationRoutingAddRelevantLegalEntity = {
  previousUrl: url.PERSON_WITH_SIGNIFICANT_CONTROL_CHOICE_URL,
  currentUrl: url.ADD_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_URL,
  nextUrl: url.WHICH_TYPE_OF_NATURE_OF_CONTROL_RELEVANT_LEGAL_ENTITY_URL,
  pageType: RegistrationPageType.addPersonWithSignificantControlRelevantLegalEntity
};

const registrationRoutingRelevantLegalEntityWhichTypeOfNatureOfControl = {
  previousUrl: url.ADD_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_WITH_IDS_URL,
  currentUrl: url.WHICH_TYPE_OF_NATURE_OF_CONTROL_RELEVANT_LEGAL_ENTITY_URL,
  nextUrl: TERRITORY_CHOICE_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_PRINCIPAL_OFFICE_ADDRESS_URL,
  pageType: RegistrationPageType.whichTypeOfNatureOfControlRelevantLegalEntity
};

// OTHER REGISTRABLE PERSON

const registrationRoutingAddOtherRegistrablePerson = {
  previousUrl: url.PERSON_WITH_SIGNIFICANT_CONTROL_CHOICE_URL,
  currentUrl: url.ADD_PERSON_WITH_SIGNIFICANT_CONTROL_OTHER_REGISTRABLE_PERSON_URL,
  nextUrl: url.WHICH_TYPE_OF_NATURE_OF_CONTROL_OTHER_REGISTRABLE_PERSON_URL,
  pageType: RegistrationPageType.addPersonWithSignificantControlOtherRegistrablePerson
};

const registrationRoutingOtherRegistrablePersonWhichTypeOfNatureOfControl = {
  previousUrl: url.ADD_PERSON_WITH_SIGNIFICANT_CONTROL_OTHER_REGISTRABLE_PERSON_WITH_IDS_URL,
  currentUrl: url.WHICH_TYPE_OF_NATURE_OF_CONTROL_OTHER_REGISTRABLE_PERSON_URL,
  nextUrl: TERRITORY_CHOICE_PERSON_WITH_SIGNIFICANT_CONTROL_OTHER_REGISTRABLE_PERSON_PRINCIPAL_OFFICE_ADDRESS_URL,
  pageType: RegistrationPageType.whichTypeOfNatureOfControlOtherRegistrablePerson
};

// INDIVIDUAL PERSON

const registrationRoutingAddIndividualPerson = {
  previousUrl: url.PERSON_WITH_SIGNIFICANT_CONTROL_CHOICE_URL,
  currentUrl: url.ADD_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_URL,
  nextUrl: url.WHICH_TYPE_OF_NATURE_OF_CONTROL_INDIVIDUAL_PERSON_URL,
  pageType: RegistrationPageType.addPersonWithSignificantControlIndividualPerson
};

const registrationRoutingIndividualPersonWhichTypeOfNatureOfControl = {
  previousUrl: url.ADD_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_WITH_IDS_URL,
  currentUrl: url.WHICH_TYPE_OF_NATURE_OF_CONTROL_INDIVIDUAL_PERSON_URL,
  nextUrl: url.ADD_NATURE_OF_CONTROL_INDIVIDUAL_URL,
  pageType: RegistrationPageType.whichTypeOfNatureOfControlIndividualPerson
};

// NATURE OF CONTROL

const registrationRoutingAddNatureOfControlIndividual = {
  previousUrl: url.WHICH_TYPE_OF_NATURE_OF_CONTROL_INDIVIDUAL_PERSON_URL,
  currentUrl: url.ADD_NATURE_OF_CONTROL_INDIVIDUAL_URL,
  nextUrl: TERRITORY_CHOICE_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_USUAL_RESIDENTIAL_ADDRESS_URL,
  pageType: RegistrationPageType.addNatureOfControlIndividual,
  data: {
    natureOfControlType: NatureOfControlType.INDIVIDUAL
  }
};

const registrationRoutingAddNatureOfControlFirm = {
  previousUrl: url.WHICH_TYPE_OF_NATURE_OF_CONTROL_INDIVIDUAL_PERSON_URL,
  currentUrl: url.ADD_NATURE_OF_CONTROL_FIRM_URL,
  nextUrl: TERRITORY_CHOICE_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_USUAL_RESIDENTIAL_ADDRESS_URL,
  pageType: RegistrationPageType.addNatureOfControlFirm,
  data: {
    natureOfControlType: NatureOfControlType.FIRM
  }
};

const registrationRoutingAddNatureOfControlTrust = {
  previousUrl: url.WHICH_TYPE_OF_NATURE_OF_CONTROL_INDIVIDUAL_PERSON_URL,
  currentUrl: url.ADD_NATURE_OF_CONTROL_TRUST_URL,
  nextUrl: TERRITORY_CHOICE_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_USUAL_RESIDENTIAL_ADDRESS_URL,
  pageType: RegistrationPageType.addNatureOfControlTrust,
  data: {
    natureOfControlType: NatureOfControlType.TRUST
  }
};

// SUMMARY

const registrationRoutingReviewPersonsWithSignificantControl = {
  previousUrl: url.PERSON_WITH_SIGNIFICANT_CONTROL_CHOICE_URL,
  currentUrl: url.REVIEW_PERSONS_WITH_SIGNIFICANT_CONTROL_URL,
  nextUrl: url.CHECK_YOUR_ANSWERS_URL,
  pageType: RegistrationPageType.reviewPersonsWithSignificantControl,
  data: {
    pageTypeIndividualPerson: RegistrationPageType.addPersonWithSignificantControlIndividualPerson,
    pageTypeRelevantLegalEntity: RegistrationPageType.addPersonWithSignificantControlRelevantLegalEntity,
    pageTypeOtherRegistrablePerson: RegistrationPageType.addPersonWithSignificantControlOtherRegistrablePerson,
    pageTypeRemove: RegistrationPageType.removePersonWithSignificantControl
  }
};

// REMOVE

const registrationRoutingRemovePersonWithSignificantControl = {
  previousUrl: url.REVIEW_PERSONS_WITH_SIGNIFICANT_CONTROL_URL,
  currentUrl: url.REMOVE_PERSON_WITH_SIGNIFICANT_CONTROL_URL,
  nextUrl: url.REVIEW_PERSONS_WITH_SIGNIFICANT_CONTROL_URL,
  pageType: RegistrationPageType.removePersonWithSignificantControl
};

const personWithSignificantControlRouting = [
  registrationRoutingPersonWithSignificantControl,
  registrationRoutingWillLimitedPartnershipHavePsc,
  registrationRoutingPersonWithSignificantControlChoice,

  registrationRoutingAddRelevantLegalEntity,
  registrationRoutingAddOtherRegistrablePerson,
  registrationRoutingAddIndividualPerson,

  registrationRoutingRelevantLegalEntityWhichTypeOfNatureOfControl,
  registrationRoutingOtherRegistrablePersonWhichTypeOfNatureOfControl,
  registrationRoutingIndividualPersonWhichTypeOfNatureOfControl,

  registrationRoutingAddNatureOfControlIndividual,
  registrationRoutingAddNatureOfControlFirm,
  registrationRoutingAddNatureOfControlTrust,

  registrationRoutingReviewPersonsWithSignificantControl,
  registrationRoutingRemovePersonWithSignificantControl
];

export default personWithSignificantControlRouting;

export const addNocUrlMap: Map<string, { address: string; previousUrl: string; territoryUrl: string; confirmUrl: string }> =
  new Map([
    [
      PersonWithSignificantControlType.INDIVIDUAL_PERSON,
      {
        address: "usual_residential_address",
        previousUrl: url.WHICH_TYPE_OF_NATURE_OF_CONTROL_INDIVIDUAL_PERSON_URL,
        territoryUrl: TERRITORY_CHOICE_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_USUAL_RESIDENTIAL_ADDRESS_URL,
        confirmUrl: CONFIRM_PERSON_WITH_SIGNIFICANT_CONTROL_INDIVIDUAL_PERSON_USUAL_RESIDENTIAL_ADDRESS_URL
      }
    ],
    [
      PersonWithSignificantControlType.RELEVANT_LEGAL_ENTITY,
      {
        address: "principal_office_address",
        previousUrl: url.WHICH_TYPE_OF_NATURE_OF_CONTROL_RELEVANT_LEGAL_ENTITY_URL,
        territoryUrl: TERRITORY_CHOICE_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_PRINCIPAL_OFFICE_ADDRESS_URL,
        confirmUrl: CONFIRM_PERSON_WITH_SIGNIFICANT_CONTROL_RELEVANT_LEGAL_ENTITY_PRINCIPAL_OFFICE_ADDRESS_URL
      }
    ],
    [
      PersonWithSignificantControlType.OTHER_REGISTRABLE_PERSON,
      {
        address: "principal_office_address",
        previousUrl: url.WHICH_TYPE_OF_NATURE_OF_CONTROL_OTHER_REGISTRABLE_PERSON_URL,
        territoryUrl: TERRITORY_CHOICE_PERSON_WITH_SIGNIFICANT_CONTROL_OTHER_REGISTRABLE_PERSON_PRINCIPAL_OFFICE_ADDRESS_URL,
        confirmUrl: CONFIRM_PERSON_WITH_SIGNIFICANT_CONTROL_OTHER_REGISTRABLE_PERSON_PRINCIPAL_OFFICE_ADDRESS_URL
      }
    ]
  ]);
