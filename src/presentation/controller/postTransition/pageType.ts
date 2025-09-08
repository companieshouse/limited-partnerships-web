import { DATE_OF_UPDATE_TYPE_PREFIX } from "../../../config/constants";

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
  whenDidTheRegisteredOfficeAddressChange = `${DATE_OF_UPDATE_TYPE_PREFIX}-the-registered-office-address-change`
}

export default PostTransitionPageType;
