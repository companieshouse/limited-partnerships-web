import { SERVICE_NAME_KEY_REGISTRATION } from "../../../../../../config/constants";

import { customerFeedbackUrlMap } from "../../../../../../middlewares/customer-feedback.middleware";

import {
  CHOOSE_REGISTERED_OFFICE_ADDRESS_URL,
  CONFIRM_REGISTERED_OFFICE_ADDRESS_URL
} from "../../../../../controller/addressLookUp/url/registration";

import { runChooseRegisteredOfficeAddressTests } from "../../../shared/partnership/address/chooseRegisteredOfficeAddress";

it("should run choose registered office address tests for registration journey", () => {
  expect(CHOOSE_REGISTERED_OFFICE_ADDRESS_URL).toContain("registration");
});

runChooseRegisteredOfficeAddressTests({
  url: CHOOSE_REGISTERED_OFFICE_ADDRESS_URL,
  redirectUrl: CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
  translateExclude: [],
  serviceTitleTranslationKey: SERVICE_NAME_KEY_REGISTRATION,
  customerFeedbackUrl: customerFeedbackUrlMap.registration
});
