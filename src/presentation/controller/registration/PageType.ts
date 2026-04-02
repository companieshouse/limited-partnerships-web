enum RegistrationPageType {
  continueSavedFiling = "continue-saved-filing",
  partnershipType = "partnership-type",
  partnershipName = "partnership-name",
  email = "registered-email-address",
  jurisdiction = "jurisdiction",
  term = "partnership-term",
  sic = "standard-industrial-classification-code",

  generalPartners = "general-partners",
  generalPartnerType = "general-partner-type",
  addGeneralPartnerPerson = "add-general-partner-person",
  addGeneralPartnerLegalEntity = "add-general-partner-legal-entity",
  reviewGeneralPartners = "review-general-partners",
  removeGeneralPartner = "remove-general-partner",

  limitedPartners = "limited-partners",
  limitedPartnerType = "limited-partner-type",
  addLimitedPartnerPerson = "add-limited-partner-person",
  addLimitedPartnerLegalEntity = "add-limited-partner-legal-entity",
  reviewLimitedPartners = "review-limited-partners",
  removeLimitedPartner = "remove-limited-partner",

  tellUsAboutPscPage = "tell-us-about-people-with-significant-control",
  willLimitedPartnershipHavePsc = "will-the-partnership-have-any-people-with-significant-control",
  personWithSignificantControlChoice = "person-with-significant-control-choice",
  addPersonWithSignificantControlIndividualPerson = "add-person-with-significant-control-individual-person",
  addPersonWithSignificantControlRelevantLegalEntity = "add-person-with-significant-control-relevant-legal-entity",
  addPersonWithSignificantControlOtherRegistrablePerson = "add-person-with-significant-control-other-registrable-person",
  whichTypeOfNatureOfControl = "which-type-of-nature-of-control",
  reviewPersonsWithSignificantControl = "review-persons-with-significant-control",

  checkYourAnswers = "check-your-answers",
  next = "next"
}

export default RegistrationPageType;
