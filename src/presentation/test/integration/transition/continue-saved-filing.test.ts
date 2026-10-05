import { CONTINUE_SAVED_FILING_URL } from "../../../controller/transition/url";
import TransitionPageType from "../../../controller/transition/PageType";
import { SERVICE_NAME_KEY_TRANSITION } from "../../../../config/constants";
import { customerFeedbackUrlMap } from "../../../../middlewares/customer-feedback.middleware";
import { runContinueSavedFilingTests } from "../shared/continueSavedFilingTestSuite";

runContinueSavedFilingTests({
  continueUrl: CONTINUE_SAVED_FILING_URL,
  pageType: TransitionPageType.continueSavedFiling,
  serviceTitleTranslationKey: SERVICE_NAME_KEY_TRANSITION,
  noRedirectUrl: "",
  customerFeedbackUrl: customerFeedbackUrlMap.transition
});
