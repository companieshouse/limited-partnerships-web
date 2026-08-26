import {
  ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
  ADD_LIMITED_PARTNER_LEGAL_ENTITY_WITH_ID_URL
} from "../../../../controller/registration/url";

import {
  CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  TERRITORY_CHOICE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL
} from "../../../../controller/addressLookUp/url/registration";
import { REGISTRATION_WITH_IDS_URL, SERVICE_NAME_KEY_REGISTRATION } from "../../../../../config";

import RegistrationPageType from "../../../../controller/registration/PageType";
import RegistrationRouting from "../../../../controller/registration/Routing";

import { runAddLimitedPartnerLegalEntityTests } from "../../shared/limitedPartner/addLimitedPartnerLegalEntity";

it("should run add limited partner legal entity tests for registration journey", () => {
  expect(ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL).toContain("registration");
});

runAddLimitedPartnerLegalEntityTests({
  url: ADD_LIMITED_PARTNER_LEGAL_ENTITY_URL,
  urlWithIds: ADD_LIMITED_PARTNER_LEGAL_ENTITY_WITH_ID_URL,
  pageType: {
    addLimitedPartnerLegalEntity: RegistrationPageType.addLimitedPartnerLegalEntity,
    reviewLimitedPartners: RegistrationPageType.reviewLimitedPartners,
    limitedPartnerType: RegistrationPageType.limitedPartnerType
  },
  pageRouting: RegistrationRouting,
  redirectUrl: TERRITORY_CHOICE_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  confirmRedirectUrl: CONFIRM_LIMITED_PARTNER_PRINCIPAL_OFFICE_ADDRESS_URL,
  baseUrlWithIds: REGISTRATION_WITH_IDS_URL,
  translateExclude: [
    "errorMessages",
    "generalPartner",
    "dateEffectiveFrom",
    "dateHint",
    "dateDay",
    "dateMonth",
    "dateYear",
    "updateTitle"
  ],
  serviceTitleTranslationKey: SERVICE_NAME_KEY_REGISTRATION
});
