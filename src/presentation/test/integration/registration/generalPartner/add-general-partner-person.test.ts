import { ADD_GENERAL_PARTNER_PERSON_URL, ADD_GENERAL_PARTNER_PERSON_WITH_ID_URL } from "../../../../controller/registration/url";

import {
  CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  TERRITORY_CHOICE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
} from "../../../../controller/addressLookUp/url/registration";

import { REGISTRATION_WITH_IDS_URL } from "../../../../../config/constants";

import RegistrationPageType from "../../../../controller/registration/PageType";

import { runAddGeneralPartnerPersonTests } from "../../shared/generalPartner/addGeneralPartnerPerson";

it("should run add general partner person tests for registration journey", () => {
  expect(ADD_GENERAL_PARTNER_PERSON_URL).toContain("registration");
});

runAddGeneralPartnerPersonTests({
  url: ADD_GENERAL_PARTNER_PERSON_URL,
  urlWithIds: ADD_GENERAL_PARTNER_PERSON_WITH_ID_URL,
  pageType: {
    addGeneralPartnerPerson: RegistrationPageType.addGeneralPartnerPerson,
    reviewGeneralPartners: RegistrationPageType.reviewGeneralPartners,
    generalPartnerType: RegistrationPageType.generalPartnerType
  },
  redirectUrl: TERRITORY_CHOICE_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  confirmRedirectUrl: CONFIRM_GENERAL_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  baseUrlWithIds: REGISTRATION_WITH_IDS_URL,
  translateExcludeAddOrUpdatePartnerPersonPage: ["errorMessages", "limitedPartner", "dateEffectiveFrom"],
  translateExcludeGeneralPartnersPage: ["title", "pageInformation"],
  serviceTitleTranslationKey: "serviceRegistration"
});
