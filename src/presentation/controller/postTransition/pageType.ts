import { CHANGE_CHECK_YOUR_ANSWERS_TYPE_SUFFIX, DATE_OF_UPDATE_TYPE_PREFIX } from "../../../config/constants";

enum PostTransitionPageType {
  companyNumber = "company-number",
  confirmLimitedPartnership = "confirm-limited-partnership",
  landingPage = "landing-page",

  generalPartnerChoice = "general-partner-choice",
  addGeneralPartnerPerson = "add-general-partner-person",
  addGeneralPartnerLegalEntity = "add-general-partner-legal-entity",
  generalPartnerCheckYourAnswers = "general-partner-check-your-answers",

  limitedPartnerChoice = "limited-partner-choice",
  addLimitedPartnerPerson = "add-limited-partner-person",
  addLimitedPartnerLegalEntity = "add-limited-partner-legal-entity",
  limitedPartnerCheckYourAnswers = "limited-partner-check-your-answers",

  enterRegisteredOfficeAddress = "enter-registered-office-address",
  whenDidTheRegisteredOfficeAddressChange = `${DATE_OF_UPDATE_TYPE_PREFIX}-the-registered-office-address-change`,
  registeredOfficeAddressChangeCheckYourAnswers = `registered-office-address-${CHANGE_CHECK_YOUR_ANSWERS_TYPE_SUFFIX}`,

  partnershipName = "name",
  whenDidThePartnershipNameChange = `${DATE_OF_UPDATE_TYPE_PREFIX}-the-partnership-name-change`,
  partnershipNameChangeCheckYourAnswers = `partnership-name-${CHANGE_CHECK_YOUR_ANSWERS_TYPE_SUFFIX}`,

  term = "term",
  whenDidTheTermChange = `${DATE_OF_UPDATE_TYPE_PREFIX}-the-term-change`
}

export default PostTransitionPageType;
