import { SERVICE_NAME_KEY_TRANSITION } from "../../../../../../config/constants";

import { customerFeedbackUrlMap } from "../../../../../../middlewares/customer-feedback.middleware";

import {
  CHOOSE_REGISTERED_OFFICE_ADDRESS_URL,
  CONFIRM_REGISTERED_OFFICE_ADDRESS_URL
} from "../../../../../controller/addressLookUp/url/transition";

import { runChooseRegisteredOfficeAddressTests } from "../../../shared/partnership/address/chooseRegisteredOfficeAddress";

it("should run choose registered office address tests for transition journey", () => {
  expect(CHOOSE_REGISTERED_OFFICE_ADDRESS_URL).toContain("transition");
});

runChooseRegisteredOfficeAddressTests({
  url: CHOOSE_REGISTERED_OFFICE_ADDRESS_URL,
  redirectUrl: CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
  confirmRedirectUrl: CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
  translateExclude: [],
  serviceTitleTranslationKey: SERVICE_NAME_KEY_TRANSITION,
  customerFeedbackUrl: customerFeedbackUrlMap.transition
});
