import { ADD_LIMITED_PARTNER_PERSON_URL, ADD_LIMITED_PARTNER_PERSON_WITH_ID_URL } from "../../../../controller/registration/url";

import {
  CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  TERRITORY_CHOICE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL
} from "../../../../controller/addressLookUp/url/registration";

import { REGISTRATION_WITH_IDS_URL, SERVICE_NAME_KEY_REGISTRATION } from "../../../../../config";

import RegistrationPageType from "../../../../controller/registration/PageType";
import RegistrationRouting from "../../../../controller/registration/Routing";

import { runAddLimitedPartnerPersonTests } from "../../shared/limitedPartner/addLimitedPartnerPerson";

it("should run add limited partner person tests for registration journey", () => {
  expect(ADD_LIMITED_PARTNER_PERSON_URL).toContain("registration");
});

runAddLimitedPartnerPersonTests({
  url: ADD_LIMITED_PARTNER_PERSON_URL,
  urlWithIds: ADD_LIMITED_PARTNER_PERSON_WITH_ID_URL,
  pageType: {
    addLimitedPartnerPerson: RegistrationPageType.addLimitedPartnerPerson,
    reviewLimitedPartners: RegistrationPageType.reviewLimitedPartners,
    limitedPartnerType: RegistrationPageType.limitedPartnerType
  },
  pageRouting: RegistrationRouting,
  redirectUrl: TERRITORY_CHOICE_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  confirmRedirectUrl: CONFIRM_LIMITED_PARTNER_USUAL_RESIDENTIAL_ADDRESS_URL,
  baseUrlWithIds: REGISTRATION_WITH_IDS_URL,
  translateExclude: ["errorMessages", "generalPartner", "dateEffectiveFrom"],
  serviceTitleTranslationKey: SERVICE_NAME_KEY_REGISTRATION
});
