import {
  CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
  ENTER_REGISTERED_OFFICE_ADDRESS_URL
} from "../../../../../controller/addressLookUp/url/transition";

import { SERVICE_NAME_KEY_TRANSITION } from "../../../../../../config/constants";

import { runEnterRegisteredOfficeAddressTests } from "../../../shared/partnership/address/enterRegisteredOfficeAddress";

it("should run enter registered office address tests for transition journey", () => {
  expect(ENTER_REGISTERED_OFFICE_ADDRESS_URL).toContain("transition");
});

runEnterRegisteredOfficeAddressTests({
  url: ENTER_REGISTERED_OFFICE_ADDRESS_URL,
  redirectUrl: CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
  translateExclude: [
    "jurisdictionCountry",
    "usualResidentialAddress",
    "correspondenceAddress",
    "principalPlaceOfBusinessAddress",
    "principalOfficeAddress",
    "errorMessages"
  ],
  translateRegisteredOfficeAddressExclude: ["provideNext"],
  serviceTitleTranslationKey: SERVICE_NAME_KEY_TRANSITION
});
