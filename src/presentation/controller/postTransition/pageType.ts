import {
  CHANGE_CHECK_YOUR_ANSWERS_TYPE_SUFFIX,
  DATE_OF_UPDATE_TYPE_PREFIX,
  REMOVE_CHECK_YOUR_ANSWERS_TYPE_SUFFIX,
  UPDATE_ADDRESS_YES_NO_TYPE_SUFFIX
} from "../../../config/constants";

enum PostTransitionPageType {
  companyNumber = "company-number",
  confirmLimitedPartnership = "confirm-limited-partnership",
  landingPage = "landing-page",

  generalPartnerType = "general-partner-type",
  addGeneralPartnerPerson = "add-general-partner-person",
  addGeneralPartnerLegalEntity = "add-general-partner-legal-entity",
  generalPartnerCheckYourAnswers = "general-partner-check-your-answers",

  limitedPartnerType = "limited-partner-type",
  addLimitedPartnerPerson = "add-limited-partner-person",
  addLimitedPartnerLegalEntity = "add-limited-partner-legal-entity",
  limitedPartnerCheckYourAnswers = "limited-partner-check-your-answers",

  enterRegisteredOfficeAddress = "enter-registered-office-address",
  whenDidTheRegisteredOfficeAddressChange = `${DATE_OF_UPDATE_TYPE_PREFIX}-the-registered-office-address-change`,
  registeredOfficeAddressChangeCheckYourAnswers = `registered-office-address-${CHANGE_CHECK_YOUR_ANSWERS_TYPE_SUFFIX}`,

  partnershipName = "partnership-name",
  whenDidThePartnershipNameChange = `${DATE_OF_UPDATE_TYPE_PREFIX}-the-partnership-name-change`,
  partnershipNameChangeCheckYourAnswers = `partnership-name-${CHANGE_CHECK_YOUR_ANSWERS_TYPE_SUFFIX}`,

  term = "partnership-term",
  whenDidTheTermChange = `${DATE_OF_UPDATE_TYPE_PREFIX}-the-term-change`,
  termChangeCheckYourAnswers = `term-${CHANGE_CHECK_YOUR_ANSWERS_TYPE_SUFFIX}`,

  enterPrincipalPlaceOfBusinessAddress = "enter-principal-place-of-business",
  whenDidThePrincipalPlaceOfBusinessAddressChange = `${DATE_OF_UPDATE_TYPE_PREFIX}-the-principal-place-of-business-change`,
  principalPlaceOfBusinessAddressChangeCheckYourAnswers = `principal-place-of-business-${CHANGE_CHECK_YOUR_ANSWERS_TYPE_SUFFIX}`,

  whenDidTheGeneralPartnerPersonCease = `${DATE_OF_UPDATE_TYPE_PREFIX}-the-general-partner-person-cease`,
  removeGeneralPartnerPersonCheckYourAnswers = `general-partner-person-${REMOVE_CHECK_YOUR_ANSWERS_TYPE_SUFFIX}`,

  whenDidTheGeneralPartnerLegalEntityCease = `${DATE_OF_UPDATE_TYPE_PREFIX}-the-general-partner-legal-entity-cease`,
  removeGeneralPartnerLegalEntityCheckYourAnswers = `general-partner-legal-entity-${REMOVE_CHECK_YOUR_ANSWERS_TYPE_SUFFIX}`,

  whenDidTheLimitedPartnerPersonCease = `${DATE_OF_UPDATE_TYPE_PREFIX}-the-limited-partner-person-cease`,
  removeLimitedPartnerPersonCheckYourAnswers = `limited-partner-person-${REMOVE_CHECK_YOUR_ANSWERS_TYPE_SUFFIX}`,

  whenDidTheLimitedPartnerLegalEntityCease = `${DATE_OF_UPDATE_TYPE_PREFIX}-the-limited-partner-legal-entity-cease`,
  removeLimitedPartnerLegalEntityCheckYourAnswers = `limited-partner-legal-entity-${REMOVE_CHECK_YOUR_ANSWERS_TYPE_SUFFIX}`,

  redesignateToPflp = "redesignate-to-pflp",

  updateGeneralPartnerPerson = "update-general-partner-person",
  updateGeneralPartnerUsualResidentialAddressYesNo = `update-general-partner-usual-residential-${UPDATE_ADDRESS_YES_NO_TYPE_SUFFIX}`,
  updateCorrespondenceAddressYesNo = `update-correspondence-${UPDATE_ADDRESS_YES_NO_TYPE_SUFFIX}`,
  whenDidGeneralPartnerPersonDetailsChange = `${DATE_OF_UPDATE_TYPE_PREFIX}-general-partner-person-details-change`,
  updateGeneralPartnerPersonCheckYourAnswers = `general-partner-person-${CHANGE_CHECK_YOUR_ANSWERS_TYPE_SUFFIX}`,

  updateGeneralPartnerLegalEntity = "update-general-partner-legal-entity",
  updateGeneralPartnerPrincipalOfficeAddressYesNo = `update-principal-office-${UPDATE_ADDRESS_YES_NO_TYPE_SUFFIX}`,
  whenDidGeneralPartnerLegalEntityDetailsChange = `${DATE_OF_UPDATE_TYPE_PREFIX}-general-partner-legal-entity-details-change`,
  updateGeneralPartnerLegalEntityCheckYourAnswers = `general-partner-legal-entity-${CHANGE_CHECK_YOUR_ANSWERS_TYPE_SUFFIX}`,

  updateLimitedPartnerPerson = "update-limited-partner-person",
  updateLimitedPartnerUsualResidentialAddressYesNo = `update-limited-partner-usual-residential-${UPDATE_ADDRESS_YES_NO_TYPE_SUFFIX}`,
  whenDidLimitedPartnerPersonDetailsChange = `${DATE_OF_UPDATE_TYPE_PREFIX}-limited-partner-person-details-change`,
  updateLimitedPartnerPersonCheckYourAnswers = `limited-partner-person-${CHANGE_CHECK_YOUR_ANSWERS_TYPE_SUFFIX}`,

  updateLimitedPartnerLegalEntity = "update-limited-partner-legal-entity",
  updateLimitedPartnerPrincipalOfficeAddressYesNo = `update-limited-partner-principal-office-${UPDATE_ADDRESS_YES_NO_TYPE_SUFFIX}`,
  whenDidLimitedPartnerLegalEntityDetailsChange = `${DATE_OF_UPDATE_TYPE_PREFIX}-limited-partner-legal-entity-details-change`,
  updateLimitedPartnerLegalEntityCheckYourAnswers = `limited-partner-legal-entity-${CHANGE_CHECK_YOUR_ANSWERS_TYPE_SUFFIX}`,
}

const CeaseDatePageTypes: string[] = [
  PostTransitionPageType.whenDidTheGeneralPartnerPersonCease,
  PostTransitionPageType.whenDidTheGeneralPartnerLegalEntityCease,
  PostTransitionPageType.whenDidTheLimitedPartnerPersonCease,
  PostTransitionPageType.whenDidTheLimitedPartnerLegalEntityCease
];

export const isCeaseDatePage = (pageType: string): boolean => {
  return CeaseDatePageTypes.includes(pageType);
};

const whenDidChangeUpdatePageTypes: string[] = [
  PostTransitionPageType.whenDidGeneralPartnerPersonDetailsChange,
  PostTransitionPageType.whenDidGeneralPartnerLegalEntityDetailsChange,
  PostTransitionPageType.whenDidLimitedPartnerPersonDetailsChange,
  PostTransitionPageType.whenDidLimitedPartnerLegalEntityDetailsChange
];

export const isWhenDidChangeUpdatePage = (pageType: string): boolean => {
  return whenDidChangeUpdatePageTypes.includes(pageType);
};

const legalEntityPageTypes: string[] = [
  PostTransitionPageType.addGeneralPartnerLegalEntity,
  PostTransitionPageType.whenDidTheGeneralPartnerLegalEntityCease,
  PostTransitionPageType.addLimitedPartnerLegalEntity,
  PostTransitionPageType.whenDidTheLimitedPartnerLegalEntityCease,
  PostTransitionPageType.updateGeneralPartnerLegalEntity,
  PostTransitionPageType.updateLimitedPartnerLegalEntity,
  PostTransitionPageType.whenDidLimitedPartnerLegalEntityDetailsChange
];

export const isLegalEntity = (pageType: string): boolean => {
  return legalEntityPageTypes.includes(pageType);
};

export default PostTransitionPageType;
