import {
  CHOOSE_REGISTERED_OFFICE_ADDRESS_URL,
  CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
  POSTCODE_REGISTERED_OFFICE_ADDRESS_URL
} from "../../../../../controller/addressLookUp/url/transition";

import { SERVICE_NAME_KEY_TRANSITION } from "../../../../../../config/constants";

import { runPostcodeRegisteredOfficeAddressTests } from "../../../shared/partnership/address/postcodeRegisteredOfficeAddress";

it("should run postcode registered office address tests for transition journey", () => {
  expect(POSTCODE_REGISTERED_OFFICE_ADDRESS_URL).toContain("transition");
});

runPostcodeRegisteredOfficeAddressTests({
  url: POSTCODE_REGISTERED_OFFICE_ADDRESS_URL,
  redirectUrl: CHOOSE_REGISTERED_OFFICE_ADDRESS_URL,
  confirmRedirectUrl: CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
  translateExclude: [
    "scotland",
    "principalPlaceOfBusiness",
    "usualResidentialAddress",
    "principalOfficeAddress",
    "correspondenceAddress",
    "errorMessages"
  ],
  translateRegisteredOfficeAddressExclude: ["provideNext"],
  serviceTitleTranslationKey: SERVICE_NAME_KEY_TRANSITION
});
