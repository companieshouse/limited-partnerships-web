import {
  CHANGE_CHECK_YOUR_ANSWERS_TYPE_SUFFIX,
  DATE_OF_UPDATE_TYPE_PREFIX,
  REMOVE_CHECK_YOUR_ANSWERS_TYPE_SUFFIX
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

  redesignateToPflp = "redesignate-to-pflp"
}

const CeaseDatePageTypes: string[] = [
  PostTransitionPageType.whenDidTheGeneralPartnerPersonCease,
  PostTransitionPageType.whenDidTheGeneralPartnerLegalEntityCease,
  PostTransitionPageType.whenDidTheLimitedPartnerPersonCease,
  PostTransitionPageType.whenDidTheLimitedPartnerLegalEntityCease
];

export function isCeaseDatePage(pageType: string): boolean {
  return CeaseDatePageTypes.includes(pageType);
}

export default PostTransitionPageType;
