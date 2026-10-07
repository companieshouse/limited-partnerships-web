import { CONFIRM_REGISTERED_OFFICE_ADDRESS_URL } from "../../../../../controller/addressLookUp/url/transition";
import { GENERAL_PARTNERS_URL } from "../../../../../controller/transition/url";

import { SERVICE_NAME_KEY_TRANSITION } from "../../../../../../config";

import { customerFeedbackUrlMap } from "../../../../../../middlewares/customer-feedback.middleware";

import { runConfirmRegisteredOfficeAddressTests } from "../../../shared/partnership/address/confirmRegisteredOfficeAddress";

it("should run confirm registered office address tests for transition journey", () => {
  expect(CONFIRM_REGISTERED_OFFICE_ADDRESS_URL).toContain("transition");
});

runConfirmRegisteredOfficeAddressTests({
  url: CONFIRM_REGISTERED_OFFICE_ADDRESS_URL,
  redirectUrl: GENERAL_PARTNERS_URL,
  translateExclude: [],
  serviceTitleTranslationKey: SERVICE_NAME_KEY_TRANSITION,
  customerFeedbackUrl: customerFeedbackUrlMap.transition
});
