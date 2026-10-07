import {
  CONFIRM_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
  POSTCODE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL
} from "../../../../../controller/addressLookUp/url/registration";

import { customerFeedbackUrlMap } from "../../../../../../middlewares/customer-feedback.middleware";

import { SERVICE_NAME_KEY_REGISTRATION } from "../../../../../../config/constants";

import { runConfirmRegisteredOfficeAddressTests } from "../../../shared/partnership/address/confirmRegisteredOfficeAddress";

it("should run confirm registered office address tests for registration journey", () => {
  expect(CONFIRM_REGISTERED_OFFICE_ADDRESS_URL).toContain("registration");
});

runConfirmRegisteredOfficeAddressTests({
  url: CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
  redirectUrl: POSTCODE_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  confirmRedirectUrl: CONFIRM_PRINCIPAL_PLACE_OF_BUSINESS_ADDRESS_URL,
  translateExclude: [],
  serviceTitleTranslationKey: SERVICE_NAME_KEY_REGISTRATION,
  customerFeedbackUrl: customerFeedbackUrlMap.registration
});
