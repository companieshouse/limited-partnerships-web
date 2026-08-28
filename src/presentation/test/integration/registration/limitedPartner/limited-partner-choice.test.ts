import {
  LIMITED_PARTNER_CHOICE_URL,
  ADD_LIMITED_PARTNER_PERSON_URL,
  ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL
} from "../../../../controller/registration/url";

import RegistrationPageType from "../../../../controller/registration/PageType";

import { SERVICE_NAME_KEY_REGISTRATION } from "../../../../../config/constants";

import { runLimitedPartnerChoiceTests } from "../../shared/limitedPartner/limitedPartnerChoice";

it("should run limited partner choice tests for registration journey", () => {
  expect(ADD_LIMITED_PARTNER_PERSON_URL).toContain("registration");
});

runLimitedPartnerChoiceTests({
  url: LIMITED_PARTNER_CHOICE_URL,
  pageType: RegistrationPageType.limitedPartnerType,
  redirectUrlPerson: ADD_LIMITED_PARTNER_PERSON_URL,
  redirectUrlLegalEntity: ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
  translateExclude: [],
  serviceTitleTranslationKey: SERVICE_NAME_KEY_REGISTRATION
});
