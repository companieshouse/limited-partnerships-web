import { CONTINUE_SAVED_FILING_URL, PARTNERSHIP_TYPE_URL } from "../../../controller/registration/url";
import RegistrationPageType from "../../../controller/registration/PageType";
import { SERVICE_NAME_REGISTRATION } from "../../../../config/constants";
import { customerFeedbackUrlMap } from "../../../../middlewares/customer-feedback.middleware";
import { runContinueSavedFilingTests } from "../shared/continueSavedFilingTestSuite";

runContinueSavedFilingTests({
  continueUrl: CONTINUE_SAVED_FILING_URL,
  pageType: RegistrationPageType.continueSavedFiling,
  serviceName: SERVICE_NAME_REGISTRATION,
  noRedirectUrl: PARTNERSHIP_TYPE_URL,
  customerFeedbackUrl: customerFeedbackUrlMap.registration
});
