import {
  ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  ADD_GENERAL_PARTNER_LEGAL_ENTITY_WITH_ID_URL
} from "../../../../controller/registration/url";

import {
  CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  TERRITORY_CHOICE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL
} from "../../../../controller/addressLookUp/url/registration";

import { REGISTRATION_WITH_IDS_URL } from "../../../../../config/constants";

import RegistrationPageType from "../../../../controller/registration/PageType";

import { runAddGeneralPartnerLegalEntityTests } from "../../shared/generalPartner/addGeneralPartnerLegalEntity";

it("should run add general partner legal entity tests for registration journey", () => {
  expect(ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL).toContain("registration");
});

runAddGeneralPartnerLegalEntityTests({
  url: ADD_GENERAL_PARTNER_LEGAL_ENTITY_URL,
  urlWithIds: ADD_GENERAL_PARTNER_LEGAL_ENTITY_WITH_ID_URL,
  pageType: {
    addGeneralPartnerLegalEntity: RegistrationPageType.addGeneralPartnerLegalEntity,
    reviewGeneralPartners: RegistrationPageType.reviewGeneralPartners,
    generalPartnerType: RegistrationPageType.generalPartnerType
  },
  redirectUrl: TERRITORY_CHOICE_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  confirmRedirectUrl: CONFIRM_GENERAL_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  baseUrlWithIds: REGISTRATION_WITH_IDS_URL,
  translateExcludeAddOrUpdatePartnerLegalEntityPage: [
    "updateTitle",
    "limitedPartner",
    "errorMessages",
    "dateEffectiveFrom",
    "dateHint",
    "dateDay",
    "dateMonth",
    "dateYear"
  ],
  translateExcludeGeneralPartnersPage: ["title", "pageInformation"],
  serviceTitleTranslationKey: "serviceRegistration"
});
