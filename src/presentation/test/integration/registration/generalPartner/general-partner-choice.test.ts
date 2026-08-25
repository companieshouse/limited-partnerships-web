import {
  ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  ADD_GENERAL_PARTNER_PERSON_URL,
  GENERAL_PARTNER_CHOICE_URL
} from "../../../../controller/registration/url";

import RegistrationPageType from "../../../../controller/registration/PageType";

import { runGeneralPartnerChoiceTests } from "../../shared/generalPartner/generalPartnerChoice";
import { SERVICE_NAME_KEY_REGISTRATION } from "../../../../../config/constants";

it("should run general partner choice tests for registration journey", () => {
  expect(ADD_GENERAL_PARTNER_PERSON_URL).toContain("registration");
});

runGeneralPartnerChoiceTests({
  url: GENERAL_PARTNER_CHOICE_URL,
  pageType: RegistrationPageType.generalPartnerType,
  redirectUrlPerson: ADD_GENERAL_PARTNER_PERSON_URL,
  redirectUrlLegalEntity: ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  translateExclude: [],
  serviceTitleTranslationKey: SERVICE_NAME_KEY_REGISTRATION
});
