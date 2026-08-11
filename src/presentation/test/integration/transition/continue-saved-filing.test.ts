import { CONTINUE_SAVED_FILING_URL, COMPANY_NUMBER_URL } from "../../../controller/transition/url";
import TransitionPageType from "../../../controller/transition/PageType";
import { SERVICE_NAME_TRANSITION } from "../../../../config/constants";
import { customerFeedbackUrlMap } from "../../../../middlewares/customer-feedback.middleware";
import { runContinueSavedFilingTests } from "../shared/continueSavedFilingTestSuite";

runContinueSavedFilingTests({
  continueUrl: CONTINUE_SAVED_FILING_URL,
  pageType: TransitionPageType.continueSavedFiling,
  serviceName: SERVICE_NAME_TRANSITION,
  noRedirectUrl: COMPANY_NUMBER_URL,
  customerFeedbackUrl: customerFeedbackUrlMap.transition
});
